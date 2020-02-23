import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import PlayerInGame from '../shared/models/PlayerInGame'
import ServerCardHand from '../models/ServerCardHand'
import ServerCardDeck from '../models/ServerCardDeck'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerCardGraveyard from '../models/ServerCardGraveyard'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import Constants from '../shared/Constants'

export default class ServerPlayerInGame implements PlayerInGame {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck
	cardGraveyard: ServerCardGraveyard
	morale: number
	unitMana: number
	spellMana: number
	turnEnded: boolean
	roundEnded: boolean

	constructor(game: ServerGame, player: ServerPlayer) {
		this.game = game
		this.player = player
		this.cardHand = new ServerCardHand(game, this, [], [])
		this.cardDeck = new ServerCardDeck(game, this, [], [])
		this.cardGraveyard = new ServerCardGraveyard(this)
		this.morale = Constants.STARTING_PLAYER_MORALE
		this.unitMana = 0
		this.spellMana = 0
		this.turnEnded = false
		this.roundEnded = false
	}

	public get targetRequired(): boolean {
		return !!this.game.cardPlay.cardResolveStack.currentCard
	}

	public get opponent(): ServerPlayerInGame {
		return this.game.getOpponent(this)
	}

	public canPlaySpell(card: ServerCard, rowIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		return this.spellMana >= card.spellCost && !!card.getValidPlayTargets(this).find(playTarget => playTarget.sourceCard === card && playTarget.targetRow === gameBoardRow)
	}

	public canPlayUnit(card: ServerCard, rowIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		return this.unitMana > 0 && !!card.getValidPlayTargets(this).find(playTarget => playTarget.sourceCard === card && playTarget.targetRow === gameBoardRow)
	}

	public drawUnitCards(count: number): void {
		const actualCount = Math.min(count, Constants.UNIT_HAND_SIZE_LIMIT - this.cardHand.unitCards.length)
		const cards: ServerCard[] = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawUnit()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.onUnitDrawn(card)
			cards.push(card)
		}

		// OutgoingMessageHandlers.notifyAboutUnitCardsDrawn(this, cards)
	}

	public drawSpellCards(count: number): void {
		const actualCount = Math.min(count, Constants.SPELL_HAND_SIZE_MAXIMUM - this.cardHand.spellCards.length)
		const cards: ServerCard[] = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawSpell()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.onSpellDrawn(card)
			cards.push(card)
		}

		// OutgoingMessageHandlers.notifyAboutSpellCardsDrawn(this, cards)
	}

	public refillSpellHand(): void {
		const cardsMissing = Constants.SPELL_HAND_SIZE_MINIMUM - this.cardHand.spellCards.length
		if (cardsMissing > 0) {
			this.drawSpellCards(cardsMissing)
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

	public setUnitMana(value: number): void {
		if (this.unitMana === value) { return }

		const delta = value - this.unitMana

		this.unitMana = value
		OutgoingMessageHandlers.notifyAboutUnitManaChange(this, delta)
	}

	public addSpellMana(value: number): void {
		this.setSpellMana(this.spellMana + value)
	}

	public setSpellMana(value: number): void {
		if (this.spellMana === value) { return }

		const delta = value - this.spellMana

		this.spellMana = value
		OutgoingMessageHandlers.notifyAboutSpellManaChange(this, delta)
	}

	public startRound(): void {
		this.roundEnded = false
		OutgoingMessageHandlers.notifyAboutRoundStarted(this)
	}

	public startTurn(): void {
		this.turnEnded = false
		OutgoingMessageHandlers.notifyAboutTurnStarted(this)
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, this)
	}

	public isAnyActionsAvailable(): boolean {
		return this.unitMana > 0 || this.spellMana > 0 || !!this.game.board.getUnitsOwnedByPlayer(this).find(unit => unit.getValidOrders().length > 0) || this.targetRequired
	}

	public endTurn(): void {
		this.turnEnded = true
		OutgoingMessageHandlers.notifyAboutTurnEnded(this)
	}

	public endRound(): void {
		this.endTurn()
		this.roundEnded = true
		OutgoingMessageHandlers.notifyAboutRoundEnded(this)
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerTemplateCardDeck) {
		const playerInGame = new ServerPlayerInGame(game, player)
		playerInGame.cardDeck.instantiateFrom(cardDeck)
		return playerInGame
	}
}
