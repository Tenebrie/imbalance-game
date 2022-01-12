import AIBehaviour from '@shared/enums/AIBehaviour'
import BoardSplitMode from '@shared/enums/BoardSplitMode'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import LeaderStatType from '@shared/enums/LeaderStatType'
import TargetMode from '@shared/enums/TargetMode'
import { SourceGame } from '@shared/models/Game'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { BuffMorningApathy } from '@src/game/models/buffs/ServerBuff'
import GameHookType from '@src/game/models/events/GameHookType'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import ServerGameIndex from '@src/game/models/ServerGameIndex'
import ServerGameProgression from '@src/game/models/ServerGameProgression'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { colorizeConsoleText, colorizeId, colorizePlayer, createRandomGameId, getTotalLeaderStat } from '@src/utils/Utils'

import ServerBotPlayer from '../AI/ServerBotPlayer'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import CardLibrary from '../libraries/CardLibrary'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayer from '../players/ServerPlayer'
import ServerPlayerInGame, { ServerBotPlayerInGame } from '../players/ServerPlayerInGame'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import GameEventCreators, { GameSetupEventArgs, PlayerTargetCardSelectedEventArgs } from './events/GameEventCreators'
import { ServerRuleset } from './rulesets/ServerRuleset'
import ServerBoard from './ServerBoard'
import ServerCard from './ServerCard'
import ServerGameAnimation from './ServerGameAnimation'
import ServerGameCardPlay from './ServerGameCardPlay'
import ServerGameEvents from './ServerGameEvents'
import ServerGameNovel from './ServerGameNovel'
import ServerGameTimers from './ServerGameTimers'
import ServerOwnedCard from './ServerOwnedCard'

interface ServerGameProps extends Partial<OptionalGameProps> {
	ruleset: RulesetConstructor
}

export interface OptionalGameProps {
	id: string
	name: string
	owner: ServerPlayer
	playerMoveOrderReversed: boolean
}

export default class ServerGame implements SourceGame {
	public readonly id: string
	public readonly name: string
	public readonly owner: ServerPlayer | undefined
	public readonly creationTimestamp: Date
	public players: ServerPlayerGroup[]
	public isStarted!: boolean
	public turnIndex!: number
	public turnPhase!: GameTurnPhase
	public roundIndex!: number
	public playersToMove!: ServerPlayerGroup[]
	public lastRoundWonBy!: ServerPlayerGroup | null
	public playerMoveOrderReversed!: boolean
	public index!: ServerGameIndex
	public board!: ServerBoard
	public novel!: ServerGameNovel
	public events!: ServerGameEvents
	public timers!: ServerGameTimers
	public cardPlay!: ServerGameCardPlay
	public animation!: ServerGameAnimation
	public ruleset!: ServerRuleset
	public progression!: ServerGameProgression

	public finalVictoriousGroup: ServerPlayerGroup | null = null

	public constructor(props: ServerGameProps) {
		this.id = props.id ? props.id : createRandomGameId()
		this.name = props.name || ServerGame.generateName(props.owner)
		this.owner = props.owner
		this.creationTimestamp = new Date()
		this.players = []
		this.turnIndex = -1
		this.roundIndex = -1
		this.turnPhase = GameTurnPhase.BEFORE_GAME
		this.index = new ServerGameIndex(this)
		this.novel = new ServerGameNovel(this)
		this.events = new ServerGameEvents(this)
		this.timers = new ServerGameTimers(this)
		this.playersToMove = []
		this.lastRoundWonBy = null
		this.animation = new ServerGameAnimation(this)
		this.cardPlay = new ServerGameCardPlay(this)
		this.progression = new ServerGameProgression(this)

		this.ruleset = new props.ruleset(this)
		this.ruleset.slots.groups.forEach((groupDefinition) => {
			const group = new ServerPlayerGroup(this, groupDefinition)
			this.players.push(group)
		})

		this.board = new ServerBoard(this)

		if (props.playerMoveOrderReversed !== undefined) {
			this.playerMoveOrderReversed = props.playerMoveOrderReversed
		} else if (this.ruleset.constants.FIRST_GROUP_MOVES_FIRST) {
			this.playerMoveOrderReversed = false
		} else if (this.ruleset.constants.SECOND_GROUP_MOVES_FIRST) {
			this.playerMoveOrderReversed = true
		} else {
			this.playerMoveOrderReversed = Math.floor(Math.random() * 2) === 0
		}

		this.events
			.createCallback<PlayerTargetCardSelectedEventArgs>(null, GameEventType.PLAYER_TARGET_SELECTED_CARD)
			.require(({ targetMode }) => targetMode === TargetMode.MULLIGAN)
			.perform(({ triggeringPlayer, targetCard }) => this.mulliganCard(triggeringPlayer, targetCard))

		this.events.createCallback<GameSetupEventArgs>(null, GameEventType.POST_GAME_SETUP).perform(() => {
			this.players.forEach((group) => OutgoingMessageHandlers.notifyAboutValidActionsChanged(this, group.players))
		})
		this.events.createCallback<GameSetupEventArgs>(null, GameEventType.POST_ROUND_STARTED).perform(() => {
			this.players.forEach((group) => OutgoingMessageHandlers.notifyAboutValidActionsChanged(this, group.players))
			this.events.evaluateSelectors()
		})
		this.ruleset.lifecycleCallback(RulesetLifecycleHook.CREATED, this)
	}

	public get activePlayer(): ServerPlayerGroup | null {
		return this.players.find((player) => !player.turnEnded && !player.roundEnded) || null
	}

	public get spectators(): ServerPlayerSpectator[] {
		return this.players.flatMap((playerGroup) => playerGroup.players).flatMap((playerInGame) => playerInGame.player.spectators)
	}

	public get allPlayers(): ServerPlayerInGame[] {
		return this.players.flatMap((playerGroup) => playerGroup.players)
	}

	public get humanPlayers(): ServerPlayerInGame[] {
		return this.allPlayers.filter((player) => player.isHuman)
	}

	private static generateName(owner?: ServerPlayer): string {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		return owner ? owner.username + `'s game #${randomNumber}` : `Game #${randomNumber}`
	}

	public addHumanPlayer(targetPlayer: ServerPlayer, targetGroup: ServerPlayerGroup, selectedDeck: ServerEditorDeck): ServerPlayerInGame {
		const player = new ServerPlayerInGame(this, {
			player: targetPlayer,
			deck: selectedDeck,
		})
		if (targetGroup.openHumanSlots <= 0) {
			throw new Error('Unable to add human player: No slots available!')
		}
		targetGroup.players.push(player)
		return player
	}

	public addBotPlayer(
		targetPlayer: ServerBotPlayer,
		targetGroup: ServerPlayerGroup,
		selectedDeck: ServerEditorDeck,
		behaviour: AIBehaviour
	): ServerPlayerInGame {
		const bot = new ServerBotPlayerInGame(this, targetPlayer, selectedDeck, behaviour)
		if (targetGroup.openBotSlots <= 0) {
			throw new Error('Unable to add bot player: No AI slots available!')
		}
		targetGroup.players.push(bot)
		return bot
	}

	public start(): void {
		this.isStarted = true

		const playerGroupOne = this.players[0]
		const playerGroupTwo = this.players[1]

		console.info(
			`Starting game ${colorizeId(this.id)}: ` + `${colorizePlayer(playerGroupOne.username)} vs ${colorizePlayer(playerGroupTwo.username)}`
		)

		this.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				OutgoingMessageHandlers.sendPlayers(playerInGame.player, playerInGame)
			})

		this.players.forEach((playerGroup) => {
			OutgoingMessageHandlers.notifyAboutGameStart(playerGroup, this.players.indexOf(playerGroup) === 1)
		})

		this.resetBoardOwnership()

		this.events.postEvent(
			GameEventCreators.gameCreated({
				game: this,
			})
		)

		const constants = this.ruleset.constants
		this.players.forEach((playerGroup) => {
			playerGroup.players.forEach((playerInGame) => {
				const extraStartingHandSize = getTotalLeaderStat(playerInGame, [LeaderStatType.STARTING_HAND_SIZE])
				playerInGame.cardDeck.shuffle()
				playerInGame.drawUnitCards(constants.UNIT_HAND_SIZE_STARTING + extraStartingHandSize)
				playerInGame.drawSpellCards(constants.SPELL_HAND_SIZE_MINIMUM)
				playerInGame.setSpellMana(constants.SPELL_MANA_PER_ROUND, null)
			})
		})

		if (this.ruleset.board) {
			const boardState = this.ruleset.board
			const symmetricBoardState = boardState.symmetricBoardState
			if (symmetricBoardState) {
				this.players.forEach((player) => {
					symmetricBoardState.forEach((row, rowIndex) => {
						row.forEach((card, cardIndex) => {
							const targetRow = this.board.getRowWithDistanceToFront(player, rowIndex)
							this.animation.instantThread(() =>
								targetRow.createUnit(CardLibrary.instantiate(this, card), targetRow.owner!.players[0], cardIndex)
							)
						})
					})
				})
			}
			const firstGroupBoardState = boardState.firstGroupBoardState
			if (firstGroupBoardState) {
				const group = this.players[0]
				firstGroupBoardState.forEach((row, rowIndex) => {
					row.forEach((card, cardIndex) => {
						const targetRow = this.board.getRowWithDistanceToFront(group, rowIndex)
						this.animation.instantThread(() => targetRow.createUnit(CardLibrary.instantiate(this, card), group.players[0], cardIndex))
					})
				})
			}
			const secondGroupBoardState = boardState.secondGroupBoardState
			if (secondGroupBoardState) {
				const group = this.players[1]
				secondGroupBoardState.forEach((row, rowIndex) => {
					row.forEach((card, cardIndex) => {
						const targetRow = this.board.getRowWithDistanceToFront(group, rowIndex)
						this.animation.instantThread(() => targetRow.createUnit(CardLibrary.instantiate(this, card), group.players[0], cardIndex))
					})
				})
			}
		}

		this.events.postEvent(
			GameEventCreators.gameSetup({
				game: this,
			})
		)
		this.events.postEvent(
			GameEventCreators.postGameSetup({
				game: this,
			})
		)

		this.events.flushLogEventGroup()
		if (!this.ruleset.constants.SKIP_MULLIGAN) {
			this.startMulliganPhase()
		} else {
			this.startNextRound()
		}

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this, this.humanPlayers)

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
			const player = this.getHumanGroup()
			for (let i = 0; i < constants.GAME_BOARD_ROW_COUNT; i++) {
				this.board.rows[i].setOwner(player)
			}
		}
	}

	public getOpponent(playerGroup: ServerPlayerGroup): ServerPlayerGroup {
		const opponent = this.players.find((otherGroup) => otherGroup !== playerGroup)
		if (!opponent) {
			throw new Error('No opponent group!')
		}
		return opponent
	}

	public getSinglePlayer(): ServerPlayerInGame {
		return this.getHumanGroup().players[0]
	}

	public getHumanGroup(): ServerPlayerGroup {
		const group = this.getHumanGroupNullable()
		if (!group) {
			throw new Error('No human group present!')
		}
		return group
	}

	public getHumanGroupNullable(): ServerPlayerGroup | null {
		return this.players.find((playerGroup) => playerGroup.slots.totalHumanSlots > 0) || null
	}

	public getBotPlayer(): ServerPlayerInGame {
		const group = this.players.find((playerGroup) => playerGroup.slots.totalBotSlots > 0)
		if (!group) {
			throw new Error('No bot group present!')
		}
		return group.players[0]
	}

	private setTurnPhase(turnPhase: GameTurnPhase): void {
		this.turnPhase = turnPhase
		OutgoingMessageHandlers.notifyAboutGamePhaseAdvance(this, this.turnPhase)
	}

	private isPhaseFinished(): boolean {
		return this.players.every((playerInGame) => playerInGame.turnEnded)
	}

	public advanceMulliganPhase(): void {
		if (this.players.every((player) => !player.mulliganMode)) {
			this.advancePhase()
		}
	}

	public advanceCurrentTurn(): void {
		if (this.activePlayer) {
			return
		}

		if (this.players.every((player) => player.roundEnded)) {
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
			if (this.ruleset.constants.SKIP_MULLIGAN) {
				this.startNextRound()
			} else {
				this.startMulliganPhase()
			}
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
		this.turnIndex = -1
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

		const playerOneTotalPower = this.board.getTotalPlayerPower(playerOne)
		const playerTwoTotalPower = this.board.getTotalPlayerPower(playerTwo)
		if (playerOneTotalPower > playerTwoTotalPower) {
			playerOne.addRoundWin()
			this.lastRoundWonBy = playerOne
		} else if (playerTwoTotalPower > playerOneTotalPower) {
			playerTwo.addRoundWin()
			this.lastRoundWonBy = playerTwo
		} else {
			playerOne.addRoundWin()
			playerTwo.addRoundWin()
		}

		const roundWinsRequired = this.ruleset.constants.ROUND_WINS_REQUIRED
		const victoriousPlayer = this.players.find((player) => player.roundWins >= roundWinsRequired) || null
		const defeatedPlayer = this.players.find((player) => player.roundWins < roundWinsRequired) || null
		if (victoriousPlayer && defeatedPlayer) {
			let victoryReason = GameVictoryCondition.UNKNOWN
			if (victoriousPlayer.isHuman && defeatedPlayer.isHuman) {
				victoryReason = GameVictoryCondition.STANDARD_PVP
			} else if (victoriousPlayer.isBot && defeatedPlayer.isHuman) {
				victoryReason = GameVictoryCondition.AI_GAME_LOSE
			} else if (victoriousPlayer.isBot && defeatedPlayer.isBot && victoriousPlayer.index === 0) {
				victoryReason = GameVictoryCondition.SIMULATED_GROUP_ONE_WIN
			} else if (victoriousPlayer.isBot && defeatedPlayer.isBot && victoriousPlayer.index === 1) {
				victoryReason = GameVictoryCondition.SIMULATED_GROUP_TWO_WIN
			} else if (victoriousPlayer.isHuman && defeatedPlayer.isBot) {
				victoryReason = GameVictoryCondition.AI_GAME_WIN
			}
			this.playerFinish(this.getOpponent(defeatedPlayer), victoryReason)
			return
		} else if (this.players.every((player) => player.roundWins >= roundWinsRequired)) {
			this.playerFinish(null, GameVictoryCondition.STANDARD_DRAW)
			return
		}

		this.board
			.getAllUnits()
			.filter((unit) => unit.card.features.includes(CardFeature.NIGHTWATCH))
			.filter((unit) => !unit.buffs.has(BuffMorningApathy))
			.forEach((unit) => {
				unit.card.buffs.add(BuffMorningApathy, null)
			})

		const unitsToDestroy = this.board.getAllUnits().filter((unit) => !unit.card.features.includes(CardFeature.NIGHTWATCH))

		unitsToDestroy.forEach((unit) => {
			this.animation.thread(() => {
				this.events.postEvent(
					GameEventCreators.unitNightfall({
						game: this,
						triggeringCard: unit.card,
						triggeringUnit: unit,
					})
				)
			})
		})
		this.animation.syncAnimationThreads()

		unitsToDestroy.forEach((unit) => {
			this.animation.thread(() => {
				this.board.destroyUnit(unit, {
					reason: UnitDestructionReason.ROUND_END,
				})
			})
		})

		this.board.rows.forEach((row) => {
			this.animation.thread(() => {
				row.buffs.removeAllSystemDispellable()
			})
		})
		this.animation.syncAnimationThreads()
		this.animation.play(ServerAnimation.delay(1250))
		this.resetBoardOwnership()

		const constants = this.ruleset.constants
		this.players.forEach((playerGroup) => {
			playerGroup.players.forEach((playerInGame) => {
				playerInGame.drawUnitCards(constants.UNIT_HAND_SIZE_PER_ROUND)
				playerInGame.setSpellMana(constants.SPELL_MANA_PER_ROUND, null)
			})
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

	public playerFinish(victoriousPlayer: ServerPlayerGroup | null, victoryCondition: GameVictoryCondition, chainImmediately = false): void {
		if (this.turnPhase === GameTurnPhase.AFTER_GAME) {
			return
		}

		const hookValues = this.events.applyHooks(
			GameHookType.GAME_FINISHED,
			{
				victoryCondition,
				finishPrevented: false,
				chainImmediately,
				victoriousPlayer,
			},
			{
				game: this,
				victoryCondition,
				victoriousPlayer,
				chainImmediately,
			}
		)

		if (hookValues.finishPrevented) {
			return
		}
		victoriousPlayer = hookValues.victoriousPlayer
		victoryCondition = hookValues.victoryCondition
		chainImmediately = hookValues.chainImmediately

		this.systemFinish(victoriousPlayer, victoryCondition, chainImmediately)
	}

	public systemFinish(victoriousPlayer: ServerPlayerGroup | null, victoryCondition: GameVictoryCondition, chainImmediately = false): void {
		if (this.turnPhase === GameTurnPhase.AFTER_GAME) {
			return
		}

		this.setTurnPhase(GameTurnPhase.AFTER_GAME)

		this.finalVictoriousGroup = victoriousPlayer

		this.events.postEvent(
			GameEventCreators.gameFinished({
				game: this,
				victoriousPlayer: victoriousPlayer,
			})
		)

		if (victoriousPlayer === null) {
			OutgoingMessageHandlers.notifyAboutDraw(this)
			console.info(`Game ${colorizeId(this.id)} finished with a draw: ${colorizeConsoleText(victoryCondition)}.`)
		} else {
			const defeatedPlayer = this.getOpponent(victoriousPlayer)!
			OutgoingMessageHandlers.notifyAboutVictory(victoriousPlayer)
			OutgoingMessageHandlers.notifyAboutDefeat(defeatedPlayer)
			console.info(
				`Game ${colorizeId(this.id)} has finished. Player ${colorizePlayer(victoriousPlayer.username)} won: ${colorizeConsoleText(
					victoryCondition
				)}.`
			)
		}
		GameHistoryDatabase.closeGame(this, victoryCondition, victoriousPlayer?.isBot ? null : victoriousPlayer).then()

		this.board.getAllUnits().forEach((unit) => {
			this.animation.thread(() => {
				this.board.destroyUnit(unit, {
					reason: UnitDestructionReason.GAME_END,
				})
			})
		})
		this.board.rows.forEach((row) => {
			this.animation.thread(() => {
				row.buffs.removeAllSystemDispellable()
			})
		})

		GameLibrary.startGameCleanupTimer(this)

		const validChain = this.ruleset.chains.find((chain) =>
			chain.isValid({
				game: this,
				victoriousPlayer,
			})
		)

		this.progression.saveStates().then(() => {
			if (validChain && this.getHumanGroup()) {
				const linkedGame = GameLibrary.createChainGame(this, validChain)
				this.allPlayers.forEach((playerInGame) => {
					OutgoingMessageHandlers.notifyAboutLinkedGame(playerInGame.player, linkedGame, chainImmediately)
				})

				if (chainImmediately) {
					this.animation.play(ServerAnimation.switchingGames())
					this.allPlayers.forEach((playerInGame) => {
						OutgoingMessageHandlers.commandJoinLinkedGame(playerInGame.player)
					})
				}
			}
		})
	}

	public get isFinished(): boolean {
		return this.turnPhase === GameTurnPhase.AFTER_GAME
	}

	public get isSpectatable(): boolean {
		return this.allPlayers.every((playerInGame) => playerInGame.player.isInGame())
	}

	public isVisibleInList(forPlayer: ServerPlayer): boolean {
		return !this.isFinished && (this.allPlayers.some((player) => player.player.id === forPlayer.id) || this.isSpectatable)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.index.findCard(cardId)
	}

	public findOwnedCardById(cardId: string): ServerOwnedCard | null {
		const cardOnBoard = this.board.findUnitById(cardId)
		if (cardOnBoard) {
			return new ServerOwnedCard(cardOnBoard.card, cardOnBoard.originalOwner)
		}
		const cardInStack = this.cardPlay.cardResolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}
		for (let g = 0; g < this.players.length; g++) {
			const playerGroup = this.players[g]

			for (let i = 0; i < playerGroup.players.length; i++) {
				const player = playerGroup.players[i]
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
		}
		return null
	}

	static newPublicInstance(ruleset: RulesetConstructor, props: Partial<OptionalGameProps>): ServerGame {
		const game = new ServerGame({
			...props,
			ruleset,
		})
		game.initializeAIPlayers()
		return game
	}

	static newOwnedInstance(owner: ServerPlayer, ruleset: RulesetConstructor, props: Partial<OptionalGameProps>): ServerGame {
		const game = new ServerGame({
			...props,
			owner,
			ruleset,
		})
		game.progression.loadStates().then(() => {
			game.ruleset.lifecycleCallback(RulesetLifecycleHook.PROGRESSION_LOADED, game)
			game.initializeAIPlayers()
		})
		return game
	}

	public initializeAIPlayers(): void {
		this.players
			.filter((playerGroup) => playerGroup.openBotSlots > 0)
			.forEach((playerGroup) => {
				const slot = playerGroup.slots.grabOpenBotSlot()
				const deck = slot.deck
				const behaviour = slot.behaviour
				this.addBotPlayer(new ServerBotPlayer(), playerGroup, ServerEditorDeck.fromConstructors(deck), behaviour)
			})
	}
}
