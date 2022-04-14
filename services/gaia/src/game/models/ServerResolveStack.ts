import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import TargetMode from '@shared/enums/TargetMode'
import ResolveStack from '@shared/models/ResolveStack'
import ResolveStackEntry from '@shared/models/ResolveStackEntry'
import { DeployTarget, PlayTarget } from '@src/game/models/ServerCardTargeting'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameEventCreators from './events/GameEventCreators'
import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'

export type ResolutionStackTarget = PlayTarget | DeployTarget

class ServerResolveStackEntry implements ResolveStackEntry {
	public readonly targetMode: TargetMode
	public readonly ownedCard: ServerOwnedCard
	public readonly previousTargets: ResolutionStackTarget[]
	public onResumeResolving: () => void
	public isEffectPrevented: boolean

	constructor(ownedCard: ServerOwnedCard, targetMode: TargetMode, onResumeResolving: () => void) {
		this.targetMode = targetMode
		this.ownedCard = ownedCard
		this.onResumeResolving = onResumeResolving
		this.previousTargets = []
		this.isEffectPrevented = false
	}

	public preventEffect(): void {
		this.isEffectPrevented = true
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

	public get previousTargets(): ResolutionStackTarget[] {
		if (this.entries.length === 0) {
			return []
		}

		return this.entries[this.entries.length - 1].previousTargets
	}

	public startResolving(ownedCard: ServerOwnedCard, targetMode: TargetMode, onResumeResolving: () => void): ServerResolveStackEntry {
		/* Create card in stack */
		const stackEntry = new ServerResolveStackEntry(ownedCard, targetMode, onResumeResolving)
		this.entries.unshift(stackEntry)
		OutgoingMessageHandlers.notifyAboutCardResolving(ownedCard)
		return stackEntry
	}

	public startResolvingImmediately(
		ownedCard: ServerOwnedCard,
		targetMode: TargetMode,
		onResumeResolving: () => void
	): ServerResolveStackEntry {
		/* Create card in stack */
		const stackEntry = new ServerResolveStackEntry(ownedCard, targetMode, onResumeResolving)
		this.entries.push(stackEntry)
		OutgoingMessageHandlers.notifyAboutCardResolving(ownedCard)
		return stackEntry
	}

	public resumeResolving(): void {
		this.entries[this.entries.length - 1].onResumeResolving()
	}

	public pushTarget(target: ResolutionStackTarget): void {
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
		if (this.entries.length === 0) {
			return
		}

		this.game.events.postEvent(
			GameEventCreators.cardPreResolved({
				game: this.game,
				triggeringCard: this.entries[this.entries.length - 1].ownedCard.card,
			})
		)

		const resolvedEntry = this.entries.pop()
		if (!resolvedEntry) {
			return
		}

		const resolvedCard = resolvedEntry.ownedCard
		OutgoingMessageHandlers.notifyAboutCardResolved(resolvedCard)

		if (resolvedCard.card.type === CardType.SPELL && resolvedCard.card.features.includes(CardFeature.HERO_POWER)) {
			resolvedCard.owner.cardDeck.addSpellToTop(resolvedCard.card)
		} else if (resolvedCard.card.type === CardType.SPELL) {
			resolvedCard.owner.cardGraveyard.addSpell(resolvedCard.card)
		}

		this.game.events.postEvent(
			GameEventCreators.cardResolved({
				game: this.game,
				triggeringCard: resolvedCard.card,
			})
		)
	}
}
