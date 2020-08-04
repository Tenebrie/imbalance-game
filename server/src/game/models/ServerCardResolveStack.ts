import ServerOwnedCard from './ServerOwnedCard'
import CardType from '@shared/enums/CardType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerGame from './ServerGame'
import ServerCardTarget from './ServerCardTarget'
import runCardEventHandler from '../utils/runCardEventHandler'
import CardFeature from '@shared/enums/CardFeature'
import GameEventCreators from './GameEventCreators'

class ServerCardResolveStackEntry {
	ownedCard: ServerOwnedCard
	targetsSelected: ServerCardTarget[]

	constructor(ownedCard: ServerOwnedCard) {
		this.ownedCard = ownedCard
		this.targetsSelected = []
	}
}

export default class ServerCardResolveStack {
	game: ServerGame
	entries: ServerCardResolveStackEntry[]

	constructor(game: ServerGame) {
		this.game = game
		this.entries = []
	}

	public get currentCard(): ServerOwnedCard | null {
		if (this.entries.length === 0) { return null }

		return this.entries[this.entries.length - 1].ownedCard
	}

	public get currentTargets(): ServerCardTarget[] | null {
		if (this.entries.length === 0) { return null }

		return this.entries[this.entries.length - 1].targetsSelected
	}

	public startResolving(ownedCard: ServerOwnedCard): void {
		/* Create card in stack */
		this.entries.push(new ServerCardResolveStackEntry(ownedCard))
		OutgoingMessageHandlers.notifyAboutCardResolving(ownedCard)
	}

	public pushTarget(target: ServerCardTarget) {
		this.currentTargets.push(target)
	}

	public findCardById(cardId: string): ServerOwnedCard | null {
		const matchingEntry = this.entries.find(entry => entry.ownedCard.card.id === cardId)
		return matchingEntry ? matchingEntry.ownedCard : null
	}

	public hasCards(): boolean {
		return this.entries.length > 0
	}

	public finishResolving(): void {
		const resolvedEntry = this.entries.pop()
		OutgoingMessageHandlers.notifyAboutCardResolved(resolvedEntry.ownedCard)

		const resolvedCard = resolvedEntry.ownedCard
		if (resolvedCard.card.features.includes(CardFeature.HERO_POWER)) {
			resolvedCard.owner.cardDeck.addSpellToTop(resolvedCard.card)
		} else if (resolvedCard.card.type === CardType.SPELL) {
			resolvedCard.owner.cardGraveyard.addSpell(resolvedCard.card)
		}

		this.game.events.postEvent(GameEventCreators.cardResolved({
			triggeringCard: resolvedCard.card
		}))

		if (this.currentCard) {
			this.game.cardPlay.checkCardTargeting(this.currentCard)
		}
	}
}
