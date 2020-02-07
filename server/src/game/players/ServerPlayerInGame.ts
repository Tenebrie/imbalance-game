import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import PlayerInGame from '../shared/models/PlayerInGame'
import ServerCardHand from '../models/ServerCardHand'
import ServerCardDeck from '../models/ServerCardDeck'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from '../models/ServerDamageSource'
import Ruleset from '../Ruleset'
import ServerCardGraveyard from '../models/ServerCardGraveyard'
import ServerCardTarget from '../models/ServerCardTarget'
import CardDeck from '../shared/models/CardDeck'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'

export default class ServerPlayerInGame extends PlayerInGame {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck
	cardGraveyard: ServerCardGraveyard
	morale: number
	timeUnits: number
	turnEnded: boolean

	constructor(game: ServerGame, player: ServerPlayer) {
		super(player)
		this.game = game
		this.player = player
		this.cardHand = new ServerCardHand(game, this, [])
		this.cardDeck = new ServerCardDeck(game, this, [])
		this.cardGraveyard = new ServerCardGraveyard(this)
		this.morale = Ruleset.STARTING_PLAYER_MORALE
		this.timeUnits = 0
		this.turnEnded = false
	}

	public get targetRequired(): boolean {
		return !!this.game.cardPlay.cardResolveStack.currentCard
	}

	public get opponent(): ServerPlayerInGame {
		return this.game.getOpponent(this)
	}

	public canPlaySpell(card: ServerCard): boolean {
		return this.timeUnits > 0
	}

	public canPlayUnit(card: ServerCard, rowIndex: number, unitIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		if (gameBoardRow.cards.length >= Ruleset.MAX_CARDS_PER_ROW || gameBoardRow.owner !== this) {
			return false
		}

		return this.timeUnits > 0
	}

	public drawCards(count: number): void {
		const actualCount = Math.min(count, Ruleset.HAND_SIZE_LIMIT - this.cardHand.cards.length)
		const cards: ServerCard[] = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawCard()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.drawCard(card)
			cards.push(card)
		}

		OutgoingMessageHandlers.notifyAboutCardsDrawn(this.player, cards)
		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentCardsDrawn(opponent.player, cards)
		}
	}

	public dealMoraleDamage(damage: ServerDamageInstance): void {
		this.setMorale(this.morale - damage.value)
	}

	public setMorale(morale: number): void {
		this.morale = morale
		const opponent = this.game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerMoraleChange(this.player, this)
		OutgoingMessageHandlers.notifyAboutOpponentMoraleChange(opponent.player, this)
	}

	public setTimeUnits(timeUnits: number): void {
		if (this.timeUnits === timeUnits) { return }

		const delta = timeUnits - this.timeUnits

		this.timeUnits = timeUnits
		const opponent = this.game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerTimeBankChange(this.player, this, delta)
		OutgoingMessageHandlers.notifyAboutOpponentTimeBankChange(opponent.player, this)
	}

	public startTurn(): void {
		this.turnEnded = false
		OutgoingMessageHandlers.notifyAboutTurnStarted(this.player)
		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(this.game, this)

		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentTurnStarted(opponent.player)
		}
	}

	public isAnyActionsAvailable(): boolean {
		return this.timeUnits > 0 || !!this.game.board.getUnitsOwnedByPlayer(this).find(unit => unit.getValidOrders().length > 0) || this.targetRequired
	}

	public endTurn(): void {
		this.turnEnded = true

		OutgoingMessageHandlers.notifyAboutTurnEnded(this.player)
		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentTurnEnded(opponent.player)
		}
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerTemplateCardDeck) {
		const playerInGame = new ServerPlayerInGame(game, player)
		playerInGame.cardDeck.instantiateFrom(cardDeck)
		return playerInGame
	}
}
