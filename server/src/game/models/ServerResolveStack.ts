import ServerOwnedCard from './ServerOwnedCard'
import CardType from '@shared/enums/CardType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerGame from './ServerGame'
import CardFeature from '@shared/enums/CardFeature'
import GameEventCreators from './events/GameEventCreators'
import ResolveStackEntry from '@shared/models/ResolveStackEntry'
import ResolveStack from '@shared/models/ResolveStack'
import { DeployTarget } from '@src/game/models/ServerCardTargeting'

class ServerResolveStackEntry implements ResolveStackEntry {
	public readonly ownedCard: ServerOwnedCard
	public readonly previousTargets: DeployTarget[]
	public onResumeResolving: () => void

	constructor(ownedCard: ServerOwnedCard, onResumeResolving: () => void) {
		this.ownedCard = ownedCard
		this.onResumeResolving = onResumeResolving
		this.previousTargets = []
	}
}

export default class ServerResolveStack implements ResolveStack {
	game: ServerGame
	public readonly entries: ServerResolveStackEntry[]

	constructor(game: ServerGame) {
		this.game = game
		this.entries = []
	}

	public get cards(): ServerOwnedCard[] {
		return this.entries.map((entry) => entry.ownedCard)
	}

	public get currentCard(): ServerOwnedCard | null {
		if (this.entries.length === 0) {
			return null
		}

		return this.entries[this.entries.length - 1].ownedCard
	}

	public get currentEntry(): ServerResolveStackEntry | null {
		if (this.entries.length === 0) {
			return null
		}

		return this.entries[this.entries.length - 1]
	}

	public get previousTargets(): DeployTarget[] {
		if (this.entries.length === 0) {
			return []
		}

		return this.entries[this.entries.length - 1].previousTargets
	}

	public startResolving(ownedCard: ServerOwnedCard, onResumeResolving: () => void): void {
		/* Create card in stack */
		this.entries.unshift(new ServerResolveStackEntry(ownedCard, onResumeResolving))
		OutgoingMessageHandlers.notifyAboutCardResolving(ownedCard)
	}

	public resumeResolving(): void {
		this.entries[this.entries.length - 1].onResumeResolving()
	}

	public pushTarget(target: DeployTarget): void {
		this.previousTargets.push(target)
	}

	public findCardById(cardId: string): ServerOwnedCard | null {
		const matchingEntry = this.entries.find((entry) => entry.ownedCard.card.id === cardId)
		return matchingEntry ? matchingEntry.ownedCard : null
	}

	public hasCards(): boolean {
		return this.entries.length > 0
	}

	public finishResolving(): void {
		const resolvedEntry = this.entries.pop()
		if (!resolvedEntry) {
			return
		}

		OutgoingMessageHandlers.notifyAboutCardResolved(resolvedEntry.ownedCard)

		const resolvedCard = resolvedEntry.ownedCard
		if (resolvedCard.card.type === CardType.SPELL && resolvedCard.card.features.includes(CardFeature.HERO_POWER)) {
			resolvedCard.card.cleanse()
			resolvedCard.owner.cardDeck.addSpellToTop(resolvedCard.card)
		} else if (resolvedCard.card.type === CardType.SPELL) {
			resolvedCard.card.cleanse()
			resolvedCard.owner.cardGraveyard.addSpell(resolvedCard.card)
		}

		this.game.events.postEvent(
			GameEventCreators.cardResolved({
				triggeringCard: resolvedCard.card,
			})
		)
	}
}
