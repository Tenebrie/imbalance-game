import ServerOwnedCard from './ServerOwnedCard'
import CardType from '@shared/enums/CardType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerGame from './ServerGame'
import ServerCardTarget, {ServerCardTargetCard, ServerCardTargetRow} from './ServerCardTarget'
import CardFeature from '@shared/enums/CardFeature'
import GameEventCreators from './GameEventCreators'
import ResolveStackEntry from '@shared/models/ResolveStackEntry'
import ResolveStack from '@shared/models/ResolveStack'

const EMPTY_FUNCTION = () => { /* Empty */ }

class ServerResolveStackEntry implements ResolveStackEntry {
	ownedCard: ServerOwnedCard
	targetsSelected: (ServerCardTargetCard | ServerCardTargetRow)[]
	onResumeResolving: () => void = EMPTY_FUNCTION

	constructor(ownedCard: ServerOwnedCard) {
		this.ownedCard = ownedCard
		this.targetsSelected = []
	}
}

export default class ServerResolveStack implements ResolveStack {
	game: ServerGame
	entries: ServerResolveStackEntry[]

	constructor(game: ServerGame) {
		this.game = game
		this.entries = []
	}

	public get cards(): ServerOwnedCard[] {
		return this.entries.map(entry => entry.ownedCard)
	}

	public get currentCard(): ServerOwnedCard | null {
		if (this.entries.length === 0) { return null }

		return this.entries[this.entries.length - 1].ownedCard
	}

	public get currentTargets(): (ServerCardTargetCard | ServerCardTargetRow)[] | undefined {
		if (this.entries.length === 0) { return undefined }

		return this.entries[this.entries.length - 1].targetsSelected
	}

	public startResolving(ownedCard: ServerOwnedCard): void {
		/* Create card in stack */
		this.entries.push(new ServerResolveStackEntry(ownedCard))
		OutgoingMessageHandlers.notifyAboutCardResolving(ownedCard)
	}

	public resumeResolving(): void {
		this.entries[this.entries.length - 1].onResumeResolving()
	}

	public pushTarget(target: ServerCardTargetCard | ServerCardTargetRow): void {
		if (!this.currentTargets) {
			return
		}
		this.currentTargets.push(target)
	}

	public onResumeResolving(callback: () => void): void {
		if (this.entries.length === 0) { return }

		this.entries[this.entries.length - 1].onResumeResolving = callback
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

		this.game.events.postEvent(GameEventCreators.cardResolved({
			triggeringCard: resolvedCard.card
		}))

		if (this.entries.length > 0) {
			this.resumeResolving()
		}
	}
}
