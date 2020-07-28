import uuidv4 from 'uuid/v4'
import Game from '@shared/models/Game'
import ServerBoard from './ServerBoard'
import ServerPlayer from '../players/ServerPlayer'
import ServerChatEntry from './ServerChatEntry'
import VoidPlayerInGame from '../utils/VoidPlayerInGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameLibrary from '../libraries/GameLibrary'
import ServerDamageInstance from './ServerDamageSource'
import Constants from '@shared/Constants'
import ServerBotPlayer from '../utils/ServerBotPlayer'
import ServerBotPlayerInGame from '../utils/ServerBotPlayerInGame'
import ServerCard from './ServerCard'
import ServerGameCardPlay from './ServerGameCardPlay'
import ServerTemplateCardDeck from './ServerTemplateCardDeck'
import ServerGameAnimation from './ServerGameAnimation'
import ServerOwnedCard from './ServerOwnedCard'
import CardLocation from '@shared/enums/CardLocation'
import {colorizeId, colorizePlayer} from '../../utils/Utils'
import ServerGameEvents from './ServerGameEvents'

export default class ServerGame extends Game {
	isStarted: boolean
	turnIndex: number
	turnPhase: GameTurnPhase
	playersToMove: ServerPlayerInGame[]
	readonly owner: ServerPlayer
	readonly board: ServerBoard
	readonly events: ServerGameEvents
	readonly players: ServerPlayerInGame[]
	readonly chatHistory: ServerChatEntry[]
	readonly cardPlay: ServerGameCardPlay
	readonly animation: ServerGameAnimation

	constructor(owner: ServerPlayer, name: string) {
		super(uuidv4(), name)
		this.isStarted = false
		this.turnIndex = -1
		this.turnPhase = GameTurnPhase.BEFORE_GAME
		this.owner = owner
		this.board = new ServerBoard(this)
		this.events = new ServerGameEvents(this)
		this.players = []
		this.playersToMove = []
		this.chatHistory = []
		this.animation = new ServerGameAnimation(this)
		this.cardPlay = new ServerGameCardPlay(this)
	}

	public addPlayer(targetPlayer: ServerPlayer, deck: ServerTemplateCardDeck): ServerPlayerInGame {
		let serverPlayerInGame
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
		const playerTwo = this.players[1] || VoidPlayerInGame.for(this)
		console.info(`Starting game ${colorizeId(this.id)}: `
			+ `${colorizePlayer(playerOne.player.username)} vs ${colorizePlayer(playerTwo.player.username)}`)

		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.sendPlayerSelf(playerInGame.player, playerInGame)
			OutgoingMessageHandlers.sendPlayerOpponent(playerInGame.player, this.getOpponent(playerInGame))
			OutgoingMessageHandlers.notifyAboutGameStart(playerInGame.player, this.players.indexOf(playerInGame) === 1)
		})

		for (let i = 0; i < 3; i++) {
			this.board.rows[i].setOwner(playerTwo)
			this.board.rows[Constants.GAME_BOARD_ROW_COUNT - i - 1].setOwner(playerOne)
		}

		this.players.forEach(playerInGame => {
			playerInGame.cardDeck.shuffle()
			playerInGame.drawUnitCards(Constants.UNIT_HAND_SIZE_STARTING)
			playerInGame.drawSpellCards(Constants.SPELL_HAND_SIZE_MINIMUM)
			playerInGame.setSpellMana(Constants.SPELL_MANA_PER_ROUND)
		})
		OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(this)
		this.startNextTurn()
		this.events.flushLogEventGroup()
	}

	public getOpponent(player: ServerPlayerInGame): ServerPlayerInGame {
		return this.players.find(otherPlayer => otherPlayer !== player) || VoidPlayerInGame.for(this)
	}

	public isBotGame(): boolean {
		return !!this.players.find(playerInGame => playerInGame instanceof ServerBotPlayerInGame)
	}

	public removePlayer(targetPlayer: ServerPlayer): void {
		const registeredPlayer = this.players.find(playerInGame => playerInGame.player.id === targetPlayer.id)
		if (!registeredPlayer) {
			return
		}

		this.players.splice(this.players.indexOf(registeredPlayer), 1)
	}

	public createChatEntry(sender: ServerPlayer, message: string): void {
		const chatEntry = ServerChatEntry.newInstance(sender, message)
		this.chatHistory.push(chatEntry)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutChatEntry(playerInGame.player, chatEntry)
		})
	}

	private setTurnPhase(turnPhase: GameTurnPhase): void {
		this.turnPhase = turnPhase

		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutPhaseAdvance(playerInGame.player, this.turnPhase)
		})
	}

	private isPhaseFinished(): boolean {
		return this.players.filter(playerInGame => !playerInGame.turnEnded).length === 0
	}

	public advanceCurrentTurn(): void {
		const playerOne = this.players[0]
		const playerTwo = this.players[1] || VoidPlayerInGame.for(this)
		const rowsOwnedByPlayerOne = this.board.rows.filter(row => row.owner === playerOne).length
		const rowsOwnedByPlayerTwo = this.board.rows.filter(row => row.owner === playerTwo).length
		const hasPlayerWonBoard = rowsOwnedByPlayerOne === Constants.GAME_BOARD_ROW_COUNT || rowsOwnedByPlayerTwo === Constants.GAME_BOARD_ROW_COUNT
		const notFinishedPlayers = this.players.filter(player => !player.roundEnded)
		if (hasPlayerWonBoard || notFinishedPlayers.length === 0) {
			this.startNextRound()
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
		if (this.turnPhase === GameTurnPhase.TURN_START) {
			this.startDeployPhase()
		} else if (this.turnPhase === GameTurnPhase.DEPLOY) {
			this.startEndTurnPhase()
		} else if (this.turnPhase === GameTurnPhase.TURN_END) {
			this.startNextTurn()
		} else if (this.turnPhase === GameTurnPhase.ROUND_START) {
			this.startNextTurn()
		}
	}

	private startNextTurn(): void {
		this.turnIndex += 1
		this.setTurnPhase(GameTurnPhase.TURN_START)

		this.playersToMove = this.players.slice()

		this.board.orders.clearPerformedOrders()
		this.advancePhase()
	}

	private startDeployPhase(): void {
		this.setTurnPhase(GameTurnPhase.DEPLOY)

		this.players.forEach(player => {
			OutgoingMessageHandlers.notifyAboutValidActionsChanged(this, player)
			OutgoingMessageHandlers.notifyAboutCardVariablesUpdated(this)
		})

		this.advanceCurrentTurn()
	}

	private startNextRound(): void {
		this.setTurnPhase(GameTurnPhase.ROUND_START)

		const playerOne = this.players[0]
		const playerTwo = this.players[1]

		const playerOneTotalPower = this.board.getUnitsOwnedByPlayer(playerOne).map(unit => unit.card.power).reduce((total, value) => total + value, 0)
		const playerTwoTotalPower = this.board.getUnitsOwnedByPlayer(playerTwo).map(unit => unit.card.power).reduce((total, value) => total + value, 0)
		if (playerOneTotalPower > playerTwoTotalPower) {
			playerTwo.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
		} else if (playerTwoTotalPower > playerOneTotalPower) {
			playerOne.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
		} else {
			playerOne.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
			playerTwo.dealMoraleDamage(ServerDamageInstance.fromUniverse(1))
		}

		const survivingPlayer = this.players.find(player => player.morale > 0) || null
		const defeatedPlayer = this.players.find(player => player.morale <= 0) || null
		if (survivingPlayer && defeatedPlayer) {
			this.finish(this.getOpponent(defeatedPlayer), 'Win condition')
			return
		} else if (this.players.every(player => player.morale <= 0)) {
			this.finish(null, 'Draw')
			return
		}

		this.board.getAllUnits().forEach(unit => {
			this.board.destroyUnit(unit)
			unit.owner.cardGraveyard.addUnit(unit.card)
		})

		for (let i = 0; i < 3; i++) {
			this.board.rows[i].setOwner(playerTwo)
			this.board.rows[Constants.GAME_BOARD_ROW_COUNT - i - 1].setOwner(playerOne)
		}

		this.players.forEach(playerInGame => {
			playerInGame.startRound()
			playerInGame.drawUnitCards(Constants.UNIT_HAND_SIZE_PER_ROUND)
			playerInGame.setSpellMana(Constants.SPELL_MANA_PER_ROUND)
		})

		this.advancePhase()
	}

	private startEndTurnPhase(): void {
		this.setTurnPhase(GameTurnPhase.TURN_END)
		this.advancePhase()
	}

	public finish(victoriousPlayer: ServerPlayerInGame | null, victoryReason: string): void {
		if (this.turnPhase === GameTurnPhase.AFTER_GAME) {
			return
		}

		this.setTurnPhase(GameTurnPhase.AFTER_GAME)

		if (victoriousPlayer === null) {
			OutgoingMessageHandlers.notifyAboutDraw(this)
			console.info(`Game ${this.id} finished with a draw. [${victoryReason}]`)
		} else {
			const defeatedPlayer = this.getOpponent(victoriousPlayer)
			OutgoingMessageHandlers.notifyAboutVictory(victoriousPlayer.player)
			OutgoingMessageHandlers.notifyAboutDefeat(defeatedPlayer.player)
			console.info(`Game ${this.id} has finished. Player ${colorizePlayer(victoriousPlayer.player.username)} won! [${victoryReason}]`)
		}

		setTimeout(() => {
			this.forceShutdown('Cleanup')
		}, 120000)
	}

	public forceShutdown(reason: string): void {
		this.players.forEach(playerInGame => playerInGame.player.disconnect())
		GameLibrary.destroyGame(this, reason)
	}

	public findCardById(cardId: string): ServerCard | null {
		const ownedCard = this.findOwnedCardById(cardId)
		return ownedCard ? ownedCard.card : null
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

	public getAllCardsForEventHandling(): ServerOwnedCard[] {
		let cards: ServerOwnedCard[] = this.board.getAllUnits()
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i]
			cards = cards.concat([new ServerOwnedCard(player.leader, player)])
			cards = cards.concat(player.cardHand.allCards.map(card => new ServerOwnedCard(card, player)))
			cards = cards.concat(player.cardDeck.allCards.map(card => new ServerOwnedCard(card, player)))
			cards = cards.concat(player.cardGraveyard.allCards.map(card => new ServerOwnedCard(card, player)))
		}
		return cards
	}

	public getTotalBuffIntensityForPlayer(buffPrototype: any, player: ServerPlayerInGame, allowedLocations: CardLocation[] | 'any' = 'any'): number {
		let viableCards = this.board.getUnitsOwnedByPlayer(player).map(unit => unit.card)
		if (player && player.leader) {
			viableCards.push(player.leader)
		}

		if (allowedLocations !== 'any') {
			viableCards = viableCards.filter(card => allowedLocations.includes(card.location))
		}

		return viableCards.map(card => card.buffs.getIntensity(buffPrototype)).reduce((total, value) => total + value, 0)
	}

	static newOwnedInstance(owner: ServerPlayer, name: string): ServerGame {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		name = name || (owner.username + `'s game #${randomNumber}`)
		return new ServerGame(owner, name)
	}
}
