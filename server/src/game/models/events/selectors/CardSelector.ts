import { EventSubscriber } from '../../ServerGameEvents'
import ServerCard from '../../ServerCard'
import ServerGame from '../../ServerGame'
import { CardSelectorProvideBuff } from './CardSelectorProvideBuff'

export type CardSelectorArgs = {
	target: ServerCard
}

export class CardSelector {
	public readonly subscriber: EventSubscriber
	private readonly selfConditions: (() => boolean)[]
	private readonly targetConditions: ((args: CardSelectorArgs) => boolean)[]
	private readonly provideBuffs: CardSelectorProvideBuff[]
	private readonly onSelectCallbacks: ((args: CardSelectorArgs) => void)[]
	private readonly onReleaseCallbacks: ((args: CardSelectorArgs) => void)[]
	private ignoreControlEffects = false

	private selectedCards: ServerCard[] = []

	constructor(
		subscriber: EventSubscriber,
		selfConditions: (() => boolean)[],
		targetConditions: ((args: CardSelectorArgs) => boolean)[],
		provideBuffs: CardSelectorProvideBuff[],
		onSelectCallbacks: ((args: CardSelectorArgs) => void)[],
		onReleaseCallbacks: ((args: CardSelectorArgs) => void)[],
		ignoreControlEffects: boolean
	) {
		this.subscriber = subscriber
		this.selfConditions = selfConditions
		this.targetConditions = targetConditions
		this.provideBuffs = provideBuffs
		this.onSelectCallbacks = onSelectCallbacks
		this.onReleaseCallbacks = onReleaseCallbacks
		this.ignoreControlEffects = ignoreControlEffects
	}

	private get game(): ServerGame {
		return this.subscriber instanceof ServerGame ? this.subscriber : this.subscriber.game
	}

	public evaluate(allGameCards: ServerCard[]): void {
		this.game.animation.syncAnimationThreads()

		if (this.selfConditions.find((condition) => !condition())) {
			this.clearSelection()
			return
		}

		const deselectedCards = this.selectedCards.filter((card) => this.targetConditions.find((condition) => !condition({ target: card })))

		const newSelectedCards = allGameCards
			.filter((card) => !this.selectedCards.includes(card))
			.filter((card) => this.targetConditions.every((condition) => condition({ target: card })))

		deselectedCards.forEach((card) => {
			this.game.animation.createAnimationThread()
			this.onReleaseCallbacks.forEach((callback) => callback({ target: card }))
			this.game.animation.commitAnimationThread()
		})

		newSelectedCards.forEach((card) => {
			this.game.animation.createAnimationThread()
			this.onSelectCallbacks.forEach((callback) => callback({ target: card }))
			this.game.animation.commitAnimationThread()
		})

		this.selectedCards = this.selectedCards.concat(newSelectedCards).filter((card) => !deselectedCards.includes(card))
	}

	public clearSelection(): void {
		this.game.animation.syncAnimationThreads()

		this.selectedCards.forEach((card) => {
			this.game.animation.createAnimationThread()
			this.onReleaseCallbacks.forEach((callback) => callback({ target: card }))
			this.game.animation.commitAnimationThread()
		})
		this.selectedCards = []
	}

	private __markedForRemoval = false
	public markForRemoval(): void {
		this.__markedForRemoval = true
	}
	public get markedForRemoval(): boolean {
		return this.__markedForRemoval
	}
}
