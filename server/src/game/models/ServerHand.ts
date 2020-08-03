import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerOwnedCard from './ServerOwnedCard'
import GameEventCreators from './GameEventCreators'

export default class ServerHand {
	unitCards: ServerCard[]
	spellCards: ServerCard[]
	owner: ServerPlayerInGame
	game: ServerGame

	constructor(game: ServerGame, playerInGame: ServerPlayerInGame, unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.game = game
		this.owner = playerInGame
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public get allCards() {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public canPlayAnyCard(): boolean {
		return !!this.unitCards.find(unit => unit.unitCost <= this.owner.unitMana) || !!this.spellCards.find(spell => spell.spellCost <= this.owner.spellMana)
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
		OutgoingMessageHandlers.notifyAboutUnitCardAdded(this.owner, card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutSpellCardAdded(this.owner, card)
	}

	public onUnitDrawn(card: ServerCard): void {
		this.addUnit(card)
		this.game.events.postEvent(GameEventCreators.cardDrawn({
			owner: this.owner,
			triggeringCard: card
		}))
	}

	public onSpellDrawn(card: ServerCard): void {
		this.addSpell(card)
		this.game.events.postEvent(GameEventCreators.cardDrawn({
			owner: this.owner,
			triggeringCard: card
		}))
	}

	public discardCard(card: ServerCard): void {
		this.removeCard(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find(card => card.id === cardId) || this.spellCards.find(card => card.id === cardId) || null
	}

	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter(unitCard => unitCard !== card)
		this.spellCards = this.spellCards.filter(unitCard => unitCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInHandDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
