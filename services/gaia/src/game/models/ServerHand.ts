import CardType from '@shared/enums/CardType'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { getClassFromConstructor } from '@src/utils/Utils'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameEventCreators from './events/GameEventCreators'
import ServerAnimation from './ServerAnimation'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'

export default class ServerHand {
	game: ServerGame
	unitCards: ServerCard[]
	spellCards: ServerCard[]
	owner: ServerPlayerInGame

	constructor(game: ServerGame, playerInGame: ServerPlayerInGame, unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.game = game
		this.owner = playerInGame
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public get allCards(): ServerCard[] {
		return this.unitCards.slice().concat(this.spellCards)
	}

	public addUnit(
		card: ServerCard,
		options: {
			index?: number
			reveal?: boolean
		} = {}
	): void {
		const index = typeof options.index === 'undefined' ? this.unitCards.length - 1 : options.index
		this.unitCards.splice(index, 0, card)
		OutgoingMessageHandlers.notifyAboutCardAddedToUnitHand(this.owner, card)
		if (options.reveal) {
			card.reveal()
		}
		if (this.game.turnPhase === GameTurnPhase.DEPLOY) {
			this.game.animation.play(ServerAnimation.cardDraw())
		}
	}

	public addSpell(
		card: ServerCard,
		options: {
			reveal?: boolean
		} = {}
	): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToSpellHand(this.owner, card)
		if (options.reveal) {
			card.reveal()
		}
		if (this.game.turnPhase === GameTurnPhase.DEPLOY) {
			this.game.animation.play(ServerAnimation.cardDraw())
		}
	}

	public addCardAsDraw(card: ServerCard): void {
		if (card.type === CardType.UNIT) {
			this.addUnit(card)
		} else {
			this.addSpell(card)
		}
		this.game.events.postEvent(
			GameEventCreators.cardDrawn({
				game: this.game,
				owner: this.owner,
				triggeringCard: card,
			})
		)
	}

	/**
	 * Properly removes the card from hand and notifies the client.
	 * Raises GameEventType.CARD_DISCARDED event.
	 */
	public discardCard(card: ServerCard): void {
		this.game.events.postEvent(
			GameEventCreators.cardDiscarded({
				game: this.game,
				owner: this.owner,
				triggeringCard: card,
			})
		)
		this.removeCard(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.unitCards.find((card) => card.id === cardId) || this.spellCards.find((card) => card.id === cardId) || null
	}

	public findCardByConstructor(cardConstructor: CardConstructor): ServerCard | null {
		return this.allCards.find((card) => card.class === getClassFromConstructor(cardConstructor)) || null
	}

	/**
	 * Properly removes the card from hand and notifies the client.
	 * Does not raise any game events.
	 */
	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInHandDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
