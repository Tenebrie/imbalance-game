import { v4 as uuidv4 } from 'uuid'
import Game from '@shared/models/Game'
import ServerBoard from './ServerBoard'
import ServerPlayer from '../players/ServerPlayer'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameLibrary from '../libraries/GameLibrary'
import ServerDamageInstance from './ServerDamageSource'
import Constants from '@shared/Constants'
import ServerBotPlayer from '../AI/ServerBotPlayer'
import ServerBotPlayerInGame from '../AI/ServerBotPlayerInGame'
import ServerCard from './ServerCard'
import ServerGameCardPlay from './ServerGameCardPlay'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'
import ServerGameAnimation from './ServerGameAnimation'
import ServerOwnedCard from './ServerOwnedCard'
import CardLocation from '@shared/enums/CardLocation'
import { colorizeId, colorizePlayer, createRandomGameId, createRandomId } from '../../utils/Utils'
import ServerGameEvents from './ServerGameEvents'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import TargetMode from '@shared/enums/TargetMode'
import GameEventType from '@shared/enums/GameEventType'
import { PlayerTargetCardSelectedEventArgs } from './events/GameEventCreators'
import ServerGameTimers from './ServerGameTimers'
import GameMode from '@shared/enums/GameMode'
import ChallengeLevel from '@shared/enums/ChallengeLevel'
import CardFeature from '@shared/enums/CardFeature'
import { BuffConstructor } from './ServerBuffContainer'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'

interface ServerGameProps extends OptionalGameProps {
	gameMode: GameMode
}

export interface OptionalGameProps {
	name?: string
	owner?: ServerPlayer
	challengeLevel?: ChallengeLevel
}

export default class ServerGame implements Game {
	public readonly id: string
	public readonly name: string
	public isStarted: boolean
	public turnIndex: number
	public turnPhase: GameTurnPhase
	public roundIndex: number
	public playersToMove: ServerPlayerInGame[]
	readonly owner: ServerPlayer | undefined
	readonly board: ServerBoard
	readonly events: ServerGameEvents
	readonly timers: ServerGameTimers
	readonly players: ServerPlayerInGame[]
	readonly cardPlay: ServerGameCardPlay
	readonly animation: ServerGameAnimation

	public gameMode: GameMode
	public challengeLevel: ChallengeLevel | null

	constructor(props: ServerGameProps) {
		this.id = createRandomGameId()
		this.name = props.name || this.generateName(props.owner)
		this.isStarted = false
		this.turnIndex = -1
		this.roundIndex = -1
		this.turnPhase = GameTurnPhase.BEFORE_GAME
		this.owner = props.owner
		this.board = new ServerBoard(this)
		this.events = new ServerGameEvents(this)
		this.timers = new ServerGameTimers(this)
		this.players = []
		this.playersToMove = []
		this.animation = new ServerGameAnimation(this)
		this.cardPlay = new ServerGameCardPlay(this)
		this.gameMode = props.gameMode
		this.challengeLevel = props.challengeLevel || null

		this.events
			.createCallback<PlayerTargetCardSelectedEventArgs>(this, GameEventType.PLAYER_TARGET_SELECTED_CARD)
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
			serverPlayerInGame = ServerBotPlayerInGame.newInstance(this, targetPlayer, deck)
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

		for (let i = 0; i < 3; i++) {
			this.board.rows[i].setOwner(playerTwo)
			this.board.rows[Constants.GAME_BOARD_ROW_COUNT - i - 1].setOwner(playerOne)
		}

		this.players.forEach((playerInGame) => {
			playerInGame.cardDeck.shuffle()
			playerInGame.drawUnitCards(Constants.UNIT_HAND_SIZE_STARTING)
			playerInGame.drawSpellCards(Constants.SPELL_HAND_SIZE_MINIMUM)
			playerInGame.setSpellMana(Constants.SPELL_MANA_PER_ROUND)
		})
		this.events.flushLogEventGroup()
		this.startMulliganPhase()

		GameHistoryDatabase.startGame(this).then()
		OutgoingMessageHandlers.executeMessageQueue(this)
	}

	public getOpponent(player: ServerPlayerInGame | null): ServerPlayerInGame | null {
		return this.players.find((otherPlayer) => otherPlayer !== player) || null
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
		const playerOne = this.players[0]
		const playerTwo = this.players[1]
		const rowsOwnedByPlayerOne = this.board.rows.filter((row) => row.owner === playerOne).length
		const rowsOwnedByPlayerTwo = this.board.rows.filter((row) => row.owner === playerTwo).length
		const hasPlayerWonBoard =
			rowsOwnedByPlayerOne === Constants.GAME_BOARD_ROW_COUNT || rowsOwnedByPlayerTwo === Constants.GAME_BOARD_ROW_COUNT
		const notFinishedPlayers = this.players.filter((player) => !player.roundEnded)
		if (hasPlayerWonBoard || notFinishedPlayers.length === 0) {
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

		this.players.forEach((player) => {
			OutgoingMessageHandlers.notifyAboutValidActionsChanged(this, player)
			OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(this)
		})
	}

	private startNextTurn(): void {
		this.turnIndex += 1
		this.setTurnPhase(GameTurnPhase.TURN_START)

		this.playersToMove = this.players.slice()

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
		} else if (playerTwoTotalPower > playerOneTotalPower) {
			playerOne.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
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
				this.board.destroyUnit(unit)
			})

		for (let i = 0; i < 3; i++) {
			this.board.rows[i].setOwner(playerTwo)
			this.board.rows[Constants.GAME_BOARD_ROW_COUNT - i - 1].setOwner(playerOne)
		}

		this.players.forEach((playerInGame) => {
			playerInGame.drawUnitCards(Constants.UNIT_HAND_SIZE_PER_ROUND)
			playerInGame.setSpellMana(Constants.SPELL_MANA_PER_ROUND)
		})

		this.advancePhase()
	}

	private startEndTurnPhase(): void {
		this.setTurnPhase(GameTurnPhase.TURN_END)
		this.advancePhase()
	}

	public get maxMulligans(): number {
		return this.turnIndex === -1 ? Constants.MULLIGAN_INITIAL_CARD_COUNT : Constants.MULLIGAN_ROUND_CARD_COUNT
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

		setTimeout(() => {
			this.forceShutdown('Cleanup')
		}, 60000)
	}

	public get isFinished(): boolean {
		return this.turnPhase === GameTurnPhase.AFTER_GAME
	}

	public forceShutdown(reason: string): void {
		GameLibrary.destroyGame(this, reason)
	}

	public findCardById(cardId: string): ServerCard | undefined {
		return this.findOwnedCardById(cardId)?.card
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

	static newOwnedInstance(owner: ServerPlayer, name: string, gameMode: GameMode, props: OptionalGameProps): ServerGame {
		return new ServerGame({
			...props,
			name,
			owner,
			gameMode,
		})
	}
}
