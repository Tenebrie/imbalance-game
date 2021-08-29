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

	public addUnit(card: ServerCard, index: number | 'default' = 'default'): void {
		index = index === 'default' ? this.unitCards.length - 1 : index
		this.unitCards.splice(index, 0, card)
		OutgoingMessageHandlers.notifyAboutCardAddedToUnitHand(this.owner, card)
		if (this.game.turnPhase === GameTurnPhase.DEPLOY) {
			this.game.animation.play(ServerAnimation.cardDraw())
		}
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
		OutgoingMessageHandlers.notifyAboutCardAddedToSpellHand(this.owner, card)
		if (this.game.turnPhase === GameTurnPhase.DEPLOY) {
			this.game.animation.play(ServerAnimation.cardDraw())
		}
	}

	public drawUnit(card: ServerCard): void {
		this.addUnit(card)
		this.game.events.postEvent(
			GameEventCreators.cardDrawn({
				game: this.game,
				owner: this.owner,
				triggeringCard: card,
			})
		)
	}

	public drawSpell(card: ServerCard): void {
		this.addSpell(card)
		this.game.events.postEvent(
			GameEventCreators.cardDrawn({
				game: this.game,
				owner: this.owner,
				triggeringCard: card,
			})
		)
	}

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

	public removeCard(card: ServerCard): void {
		this.unitCards = this.unitCards.filter((unitCard) => unitCard !== card)
		this.spellCards = this.spellCards.filter((spellCard) => spellCard !== card)

		OutgoingMessageHandlers.notifyAboutCardInHandDestroyed(new ServerOwnedCard(card, this.owner))
	}
}
