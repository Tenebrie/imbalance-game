import ServerOwnedCard from './ServerOwnedCard'
import CardType from '../shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import ServerGame from './ServerGame'
import ServerCardTarget from './ServerCardTarget'

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
		const card = ownedCard.card
		const owner = ownedCard.owner

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
		if (resolvedCard.card.cardType === CardType.SPELL) {
			resolvedCard.owner.cardGraveyard.addCard(resolvedCard.card)
		}
	}
}
