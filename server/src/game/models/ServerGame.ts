import Game from '@shared/models/Game'
import ServerBoard from './ServerBoard'
import ServerPlayer from '../players/ServerPlayer'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameLibrary from '../libraries/GameLibrary'
import ServerDamageInstance from './ServerDamageSource'
import ServerBotPlayer from '../AI/ServerBotPlayer'
import ServerBotPlayerInGame from '../AI/ServerBotPlayerInGame'
import ServerCard from './ServerCard'
import ServerGameCardPlay from './ServerGameCardPlay'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'
import ServerGameAnimation from './ServerGameAnimation'
import ServerOwnedCard from './ServerOwnedCard'
import CardLocation from '@shared/enums/CardLocation'
import { colorizeId, colorizePlayer, createRandomGameId } from '@src/utils/Utils'
import ServerGameEvents from './ServerGameEvents'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import TargetMode from '@shared/enums/TargetMode'
import GameEventType from '@shared/enums/GameEventType'
import GameEventCreators, { PlayerTargetCardSelectedEventArgs } from './events/GameEventCreators'
import ServerGameTimers from './ServerGameTimers'
import CardFeature from '@shared/enums/CardFeature'
import { BuffConstructor } from './ServerBuffContainer'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import ServerGameIndex from '@src/game/models/ServerGameIndex'
import ServerAnimation from '@src/game/models/ServerAnimation'
import { ServerRuleset, ServerRulesetTemplate } from './rulesets/ServerRuleset'
import CardLibrary from '../libraries/CardLibrary'
import ServerGameNovel from './ServerGameNovel'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'

interface ServerGameProps extends OptionalGameProps {
	ruleset: ServerRulesetTemplate
}

export interface OptionalGameProps {
	name?: string
	owner?: ServerPlayer
	playerMoveOrderReversed?: boolean
}

export default class ServerGame implements Game {
	public readonly id: string
	public readonly name: string
	public isStarted: boolean
	public turnIndex: number
	public turnPhase: GameTurnPhase
	public roundIndex: number
	public playersToMove: ServerPlayerInGame[]
	public lastRoundWonBy: ServerPlayerInGame | null
	public playerMoveOrderReversed: boolean
	readonly owner: ServerPlayer | undefined
	readonly board: ServerBoard
	readonly novel: ServerGameNovel
	readonly index: ServerGameIndex
	readonly events: ServerGameEvents
	readonly timers: ServerGameTimers
	readonly players: ServerPlayerInGame[]
	readonly cardPlay: ServerGameCardPlay
	readonly animation: ServerGameAnimation

	public ruleset: ServerRuleset

	constructor(props: ServerGameProps) {
		this.id = createRandomGameId()
		this.name = props.name || this.generateName(props.owner)
		this.ruleset = props.ruleset.__build()
		this.isStarted = false
		this.turnIndex = -1
		this.roundIndex = -1
		this.turnPhase = GameTurnPhase.BEFORE_GAME
		this.owner = props.owner
		this.index = new ServerGameIndex(this)
		this.board = new ServerBoard(this)
		this.novel = new ServerGameNovel(this)
		this.events = new ServerGameEvents(this)
		this.timers = new ServerGameTimers(this)
		this.players = []
		this.playersToMove = []
		this.lastRoundWonBy = null
		this.playerMoveOrderReversed =
			props.playerMoveOrderReversed !== undefined ? props.playerMoveOrderReversed : Math.floor(Math.random() * 2) === 0
		this.animation = new ServerGameAnimation(this)
		this.cardPlay = new ServerGameCardPlay(this)

		props.ruleset.__applyAmplifiers(this)

		this.events
			.createCallback<PlayerTargetCardSelectedEventArgs>(null, GameEventType.PLAYER_TARGET_SELECTED_CARD)
			.require(({ targetMode }) => targetMode === TargetMode.MULLIGAN)
			.perform(({ triggeringPlayer, targetCard }) => this.mulliganCard(triggeringPlayer, targetCard))
	}

	public get activePlayer(): ServerPlayerInGame | null {
		return this.players.find((player) => !player.turnEnded && !player.roundEnded) || null
	}

	public get spectators(): ServerPlayerSpectator[] {
		return this.players.map((playerInGame) => playerInGame.player.spectators).flat()
	}

	private generateName(owner?: ServerPlayer): string {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		return owner ? owner.username + `'s game #${randomNumber}` : `Game #${randomNumber}`
	}

	public addPlayer(targetPlayer: ServerPlayer, deck: ServerTemplateCardDeck): ServerPlayerInGame {
		let serverPlayerInGame: ServerPlayerInGame
		if (targetPlayer instanceof ServerBotPlayer) {
			const bot = ServerBotPlayerInGame.newInstance(this, targetPlayer, deck)
			if (this.ruleset.ai) {
				bot.setBehaviour(this.ruleset.ai.behaviour)
			}
			serverPlayerInGame = bot
		} else {
			serverPlayerInGame = ServerPlayerInGame.newInstance(this, targetPlayer, deck)
		}

		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.sendPlayerOpponent(playerInGame.player, serverPlayerInGame)
		})

		if (this.isBotGame()) {
			this.players.splice(0, 0, serverPlayerInGame)
		} else {
			this.players.push(serverPlayerInGame)
		}
		return serverPlayerInGame
	}

	public start(): void {
		this.isStarted = true

		const playerOne = this.players[0]
		const playerTwo = this.players[1]
		console.info(
			`Starting game ${colorizeId(this.id)}: ` +
				`${colorizePlayer(playerOne.player.username)} vs ${colorizePlayer(playerTwo.player.username)}`
		)

		this.players.forEach((playerInGame) => {
			OutgoingMessageHandlers.sendPlayerSelf(playerInGame.player, playerInGame)
			OutgoingMessageHandlers.sendPlayerOpponent(playerInGame.player, this.getOpponent(playerInGame)!)
		})

		this.players.forEach((playerInGame) => {
			OutgoingMessageHandlers.notifyAboutDeckLeader(playerInGame, playerInGame.opponent!, playerInGame.leader)
		})

		this.players.forEach((playerInGame) => {
			OutgoingMessageHandlers.notifyAboutGameStart(playerInGame.player, this.players.indexOf(playerInGame) === 1)
		})

		this.resetBoardOwnership()

		const constants = this.ruleset.constants
		this.players.forEach((playerInGame) => {
			playerInGame.cardDeck.shuffle()
			playerInGame.drawUnitCards(constants.UNIT_HAND_SIZE_STARTING)
			playerInGame.drawSpellCards(constants.SPELL_HAND_SIZE_MINIMUM)
			playerInGame.setSpellMana(constants.SPELL_MANA_PER_ROUND)
		})

		if (this.ruleset.board) {
			const boardState = this.ruleset.board
			const symmetricBoardState = boardState.symmetricBoardState
			if (symmetricBoardState) {
				this.players.forEach((player) => {
					symmetricBoardState.forEach((row, rowIndex) => {
						row.forEach((card, cardIndex) => {
							const targetRow = this.board.getRowWithDistanceToFront(player, rowIndex)
							this.animation.instantThread(() => targetRow.createUnit(CardLibrary.instantiateByConstructor(this, card), cardIndex))
						})
					})
				})
			}
			if (this.ruleset.ai) {
				const humanPlayer = this.getHumanPlayer()
				const playerBoardState = boardState.playerBoardState
				if (playerBoardState && humanPlayer) {
					playerBoardState.forEach((row, rowIndex) => {
						row.forEach((card, cardIndex) => {
							const targetRow = this.board.getRowWithDistanceToFront(humanPlayer, rowIndex)
							this.animation.instantThread(() => targetRow.createUnit(CardLibrary.instantiateByConstructor(this, card), cardIndex))
						})
					})
				}

				const botPlayer = this.getBotPlayer()
				const opponentBoardState = boardState.opponentBoardState
				if (opponentBoardState && botPlayer) {
					opponentBoardState.forEach((row, rowIndex) => {
						row.forEach((card, cardIndex) => {
							const targetRow = this.board.getRowWithDistanceToFront(botPlayer, rowIndex)
							this.animation.instantThread(() => targetRow.createUnit(CardLibrary.instantiateByConstructor(this, card), cardIndex))
						})
					})
				}
			}
		}

		this.events.postEvent(
			GameEventCreators.gameSetup({
				game: this,
			})
		)

		this.events.flushLogEventGroup()
		this.startMulliganPhase()

		GameHistoryDatabase.startGame(this).then()
		this.events.resolveEvents()
		OutgoingMessageHandlers.executeMessageQueue(this)
	}

	private resetBoardOwnership(): void {
		const constants = this.ruleset.constants
		if (constants.GAME_BOARD_ROW_SPLIT_MODE === BoardSplitMode.SPLIT_IN_HALF) {
			for (let i = 0; i < constants.GAME_BOARD_ROW_COUNT / 2; i++) {
				this.board.rows[i].setOwner(this.players[1])
				this.board.rows[constants.GAME_BOARD_ROW_COUNT - i - 1].setOwner(this.players[0])
			}
		} else if (constants.GAME_BOARD_ROW_SPLIT_MODE === BoardSplitMode.ALL_FOR_PLAYER) {
			const player = this.getHumanPlayer()!
			for (let i = 0; i < constants.GAME_BOARD_ROW_COUNT; i++) {
				this.board.rows[i].setOwner(player)
			}
		}
	}

	public getOpponent(player: ServerPlayerInGame | null): ServerPlayerInGame | null {
		return this.players.find((otherPlayer) => otherPlayer !== player) || null
	}

	public getHumanPlayer(): ServerPlayerInGame | null {
		return this.players.find((playerInGame) => !(playerInGame instanceof ServerBotPlayerInGame)) || null
	}

	public getBotPlayer(): ServerPlayerInGame | null {
		return this.players.find((playerInGame) => playerInGame instanceof ServerBotPlayerInGame) || null
	}

	public isBotGame(): boolean {
		return !!this.players.find((playerInGame) => playerInGame instanceof ServerBotPlayerInGame)
	}

	public removePlayer(targetPlayer: ServerPlayer): void {
		const registeredPlayer = this.players.find((playerInGame) => playerInGame.player.id === targetPlayer.id)
		if (!registeredPlayer) {
			return
		}

		this.players.splice(this.players.indexOf(registeredPlayer), 1)
	}

	private setTurnPhase(turnPhase: GameTurnPhase): void {
		this.turnPhase = turnPhase
		OutgoingMessageHandlers.notifyAboutGamePhaseAdvance(this, this.turnPhase)
	}

	private isPhaseFinished(): boolean {
		return this.players.filter((playerInGame) => !playerInGame.turnEnded).length === 0
	}

	public advanceMulliganPhase(): void {
		if (this.players.every((player) => !player.mulliganMode)) {
			this.advancePhase()
		}
	}

	public advanceCurrentTurn(): void {
		const notFinishedPlayers = this.players.filter((player) => !player.roundEnded)
		if (notFinishedPlayers.length === 0) {
			this.endCurrentRound()
			return
		}

		let playerToMove = this.playersToMove.shift()
		if (playerToMove && playerToMove.roundEnded) {
			playerToMove.onTurnStart()
			playerToMove.onTurnEnd()
			playerToMove = this.playersToMove.shift()
		}

		if (playerToMove) {
			playerToMove.startTurn()
		}

		if (this.isPhaseFinished()) {
			this.advancePhase()
		}
	}

	private advancePhase(): void {
		if (this.turnPhase === GameTurnPhase.MULLIGAN) {
			this.startNextRound()
		} else if (this.turnPhase === GameTurnPhase.ROUND_START) {
			this.startNextTurn()
		} else if (this.turnPhase === GameTurnPhase.TURN_START) {
			this.startDeployPhase()
		} else if (this.turnPhase === GameTurnPhase.DEPLOY) {
			this.startEndTurnPhase()
		} else if (this.turnPhase === GameTurnPhase.TURN_END) {
			this.startNextTurn()
		} else if (this.turnPhase === GameTurnPhase.ROUND_END) {
			this.startMulliganPhase()
		}
	}

	private startMulliganPhase(): void {
		this.setTurnPhase(GameTurnPhase.MULLIGAN)

		this.players.forEach((playerInGame) => {
			playerInGame.startMulligan()
		})
	}

	private startNextRound(): void {
		this.roundIndex += 1
		this.setTurnPhase(GameTurnPhase.ROUND_START)

		this.players.forEach((playerInGame) => {
			playerInGame.startRound()
		})

		this.startNextTurn()
		this.events.flushLogEventGroup()
	}

	private startDeployPhase(): void {
		this.setTurnPhase(GameTurnPhase.DEPLOY)

		this.advanceCurrentTurn()

		this.players.forEach(() => {
			OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(this)
		})
	}

	private startNextTurn(): void {
		this.turnIndex += 1
		this.setTurnPhase(GameTurnPhase.TURN_START)

		this.playersToMove = this.players.slice()
		if (this.lastRoundWonBy === this.players[1] || (this.lastRoundWonBy === null && this.playerMoveOrderReversed)) {
			this.playersToMove.reverse()
		}

		this.board.orders.clearPerformedOrders()
		this.advancePhase()
	}

	private endCurrentRound(): void {
		this.setTurnPhase(GameTurnPhase.ROUND_END)

		const playerOne = this.players[0]
		const playerTwo = this.players[1]

		const playerOneTotalPower = this.board
			.getUnitsOwnedByPlayer(playerOne)
			.map((unit) => unit.card.stats.power)
			.reduce((total, value) => total + value, 0)
		const playerTwoTotalPower = this.board
			.getUnitsOwnedByPlayer(playerTwo)
			.map((unit) => unit.card.stats.power)
			.reduce((total, value) => total + value, 0)
		if (playerOneTotalPower > playerTwoTotalPower) {
			playerTwo.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
			this.lastRoundWonBy = playerOne
		} else if (playerTwoTotalPower > playerOneTotalPower) {
			playerOne.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
			this.lastRoundWonBy = playerTwo
		} else {
			playerOne.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
			playerTwo.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
		}

		const survivingPlayer = this.players.find((player) => player.morale > 0) || null
		const defeatedPlayer = this.players.find((player) => player.morale <= 0) || null
		if (survivingPlayer && defeatedPlayer) {
			let victoryReason = 'PvP win condition'
			if (survivingPlayer.isBot) {
				victoryReason = 'Player lost to AI'
			} else if (defeatedPlayer.isBot) {
				victoryReason = 'Player won vs AI'
			}
			this.finish(this.getOpponent(defeatedPlayer), victoryReason)
			return
		} else if (this.players.every((player) => player.morale <= 0)) {
			this.finish(null, 'Game ended with a draw')
			return
		}

		this.board
			.getAllUnits()
			.filter((unit) => !unit.card.features.includes(CardFeature.BUILDING))
			.filter((unit) => !unit.card.features.includes(CardFeature.NIGHTWATCH))
			.forEach((unit) => {
				this.animation.thread(() => {
					this.board.destroyUnit(unit)
				})
			})
		this.animation.syncAnimationThreads()
		this.animation.play(ServerAnimation.delay(1250))

		this.resetBoardOwnership()

		const constants = this.ruleset.constants
		this.players.forEach((playerInGame) => {
			playerInGame.drawUnitCards(constants.UNIT_HAND_SIZE_PER_ROUND)
			playerInGame.setSpellMana(constants.SPELL_MANA_PER_ROUND)
		})

		this.advancePhase()
	}

	private startEndTurnPhase(): void {
		this.setTurnPhase(GameTurnPhase.TURN_END)
		this.advancePhase()
	}

	public get maxMulligans(): number {
		const constants = this.ruleset.constants
		return this.turnIndex === -1 ? constants.MULLIGAN_INITIAL_CARD_COUNT : constants.MULLIGAN_ROUND_CARD_COUNT
	}

	public mulliganCard(player: ServerPlayerInGame, card: ServerCard): void {
		if (!player.cardHand.unitCards.includes(card) || player.cardsMulliganed >= this.maxMulligans) {
			return
		}

		player.mulliganCard(card)
		player.cardsMulliganed += 1
		OutgoingMessageHandlers.notifyAboutCardsMulliganed(player.player, player)
		player.showMulliganCards()
	}

	public finish(victoriousPlayer: ServerPlayerInGame | null, victoryReason: string): void {
		if (this.turnPhase === GameTurnPhase.AFTER_GAME) {
			return
		}

		this.setTurnPhase(GameTurnPhase.AFTER_GAME)

		this.events.postEvent(
			GameEventCreators.gameFinished({
				game: this,
				victoriousPlayer: victoriousPlayer,
			})
		)

		if (victoriousPlayer === null) {
			OutgoingMessageHandlers.notifyAboutDraw(this)
			console.info(`Game ${colorizeId(this.id)} finished with a draw. [${victoryReason}]`)
		} else {
			const defeatedPlayer = this.getOpponent(victoriousPlayer)!
			OutgoingMessageHandlers.notifyAboutVictory(victoriousPlayer.player)
			OutgoingMessageHandlers.notifyAboutDefeat(defeatedPlayer.player)
			console.info(
				`Game ${colorizeId(this.id)} has finished. Player ${colorizePlayer(victoriousPlayer.player.username)} won! [${victoryReason}]`
			)
		}
		GameHistoryDatabase.closeGame(this, victoryReason, victoriousPlayer instanceof ServerBotPlayerInGame ? null : victoriousPlayer).then()

		this.board.getAllUnits().forEach((unit) => {
			this.animation.thread(() => {
				this.board.destroyUnit(unit)
			})
		})

		setTimeout(() => {
			this.forceShutdown('Cleanup')
		}, 300000)
	}

	public get isFinished(): boolean {
		return this.turnPhase === GameTurnPhase.AFTER_GAME
	}

	public forceShutdown(reason: string): void {
		GameLibrary.destroyGame(this, reason)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.index.findCard(cardId)
	}

	public findOwnedCardById(cardId: string): ServerOwnedCard | null {
		const cardOnBoard = this.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard
		}
		const cardInStack = this.cardPlay.cardResolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i]
			const cardAsLeader = player.leader
			if (cardAsLeader && cardAsLeader.id === cardId) {
				return new ServerOwnedCard(cardAsLeader, player)
			}
			const cardInHand = player.cardHand.findCardById(cardId)
			if (cardInHand) {
				return new ServerOwnedCard(cardInHand, player)
			}
			const cardInDeck = player.cardDeck.findCardById(cardId)
			if (cardInDeck) {
				return new ServerOwnedCard(cardInDeck, player)
			}
			const cardInGraveyard = player.cardGraveyard.findCardById(cardId)
			if (cardInGraveyard) {
				return new ServerOwnedCard(cardInGraveyard, player)
			}
		}
		return null
	}

	public getTotalBuffIntensityForPlayer(
		buffPrototype: BuffConstructor,
		player: ServerPlayerInGame,
		allowedLocations: CardLocation[] | 'any' = 'any'
	): number {
		let viableCards = this.board.getUnitsOwnedByPlayer(player).map((unit) => unit.card)
		if (player && player.leader) {
			viableCards.push(player.leader)
		}

		if (allowedLocations !== 'any') {
			viableCards = viableCards.filter((card) => allowedLocations.includes(card.location))
		}

		return viableCards.map((card) => card.buffs.getIntensity(buffPrototype)).reduce((total, value) => total + value, 0)
	}

	static newOwnedInstance(owner: ServerPlayer, name: string, ruleset: ServerRulesetTemplate, props: OptionalGameProps): ServerGame {
		return new ServerGame({
			...props,
			name,
			owner,
			ruleset,
		})
	}
}
