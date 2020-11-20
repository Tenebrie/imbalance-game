import {EventSubscriber} from '../ServerGameEvents'
import ServerCard from '../ServerCard'
import ServerGame from '../ServerGame'

type CardSelectorArgs = {
	target: ServerCard
}

export class CardSelector {
	public readonly subscriber: EventSubscriber
	private readonly selfConditions: (() => boolean)[]
	private readonly targetConditions: ((args: CardSelectorArgs) => boolean)[]
	private readonly onSelectCallbacks: ((args: CardSelectorArgs) => void)[]
	private readonly onReleaseCallbacks: ((args: CardSelectorArgs) => void)[]
	private ignoreControlEffects = false

	private selectedCards: ServerCard[] = []

	constructor(subscriber: EventSubscriber,
		selfConditions: (() => boolean)[],
		targetConditions: ((args: CardSelectorArgs) => boolean)[],
		onSelectCallbacks: ((args: CardSelectorArgs) => void)[],
		onReleaseCallbacks: ((args: CardSelectorArgs) => void)[],
		ignoreControlEffects: boolean) {

		this.subscriber = subscriber
		this.selfConditions = selfConditions
		this.targetConditions = targetConditions
		this.onSelectCallbacks = onSelectCallbacks
		this.onReleaseCallbacks = onReleaseCallbacks
		this.ignoreControlEffects = ignoreControlEffects
	}

	private get game(): ServerGame {
		return this.subscriber instanceof ServerGame ? this.subscriber : this.subscriber.game
	}

	public evaluate(allGameCards: ServerCard[]): void {
		if (this.selfConditions.find(condition => !condition())) {
			return
		}

		const newSelectedCards = allGameCards
			.filter(card => !this.selectedCards.includes(card))
			.filter(card =>
				this.targetConditions.every(condition => condition({
					target: card
				}))
			)
		const deselectedCards = this.selectedCards.filter(card =>
			this.targetConditions.find(condition => !condition({
				target: card
			}))
		)

		newSelectedCards.forEach(card => {
			this.game.animation.createAnimationThread()
			this.onSelectCallbacks.forEach(callback => callback({
				target: card
			}))
			this.game.animation.commitAnimationThread()
		})

		deselectedCards.forEach(card => {
			this.game.animation.createAnimationThread()
			this.onReleaseCallbacks.forEach(callback => callback({
				target: card
			}))
			this.game.animation.commitAnimationThread()
		})

		this.selectedCards = this.selectedCards
			.concat(newSelectedCards)
			.filter(card => !deselectedCards.includes(card))
	}

	public clearSelection(): void {
		this.selectedCards.forEach(card => {
			this.game.animation.createAnimationThread()
			this.onReleaseCallbacks.forEach(callback => callback({
				target: card
			}))
			this.game.animation.commitAnimationThread()
		})
		this.selectedCards = []
	}
}

export class CardSelectorBuilder {
	private readonly __subscriber: EventSubscriber
	private readonly __selfConditions: (() => boolean)[]
	private readonly __targetConditions: ((args: CardSelectorArgs) => boolean)[]
	private readonly __onSelectCallbacks: ((args: CardSelectorArgs) => void)[]
	private readonly __onReleaseCallbacks: ((args: CardSelectorArgs) => void)[]
	private __ignoreControlEffects = false

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__selfConditions = []
		this.__targetConditions = []
		this.__onSelectCallbacks = []
		this.__onReleaseCallbacks = []
	}

	public build(): CardSelector {
		return new CardSelector(this.__subscriber, this.__selfConditions, this.__targetConditions, this.__onSelectCallbacks, this.__onReleaseCallbacks, this.__ignoreControlEffects)
	}

	/* Require a condition to be true for a card to be selected
	 * --------------------------------------------------------
	 * Add a new condition to the require chain.
	 * Use this function if the condition doesn't need to access the target card and only applies
	 * to the current card or another game state.
	 *
	 * The selection will only execute if all conditions return `true` or other truthy value.
	 */
	public require(condition: () => boolean): CardSelectorBuilder {
		this.__selfConditions.push(condition)
		return this
	}

	/* Require a condition to be true for a card to be selected
	 * --------------------------------------------------------
	 * Add a new condition to the require chain.
	 * Use this function only if the condition needs to access the target card.
	 *
	 * The selection will only execute if all conditions return `true` or other truthy value.
	 */
	public requireTarget(condition: (args: CardSelectorArgs) => boolean): CardSelectorBuilder {
		this.__targetConditions.push(condition)
		return this
	}

	/* Execute code for every selected card
	 * ------------------------------------
	 * Add a new callback for a selected card. A card is selected when the require chain
	 * switches from 'false' to 'true'
	 */
	public onSelected(callback: (args: CardSelectorArgs) => void): CardSelectorBuilder {
		this.__onSelectCallbacks.push(callback)
		return this
	}

	/* Execute code for every released card
	 * ------------------------------------
	 * Add a new callback for a released card. A card is released when the require chain
	 * switches from 'true' to 'false'
	 */
	public onReleased(callback: (args: CardSelectorArgs) => void): CardSelectorBuilder {
		this.__onReleaseCallbacks.push(callback)
		return this
	}

	/* Ignore control effects
	 * ------------------------------------------------------------------------
	 * This selector will ignore stun and suspension effects applied to card and fire even if the normal callbacks would be skipped.
	 */
	public forceIgnoreControlEffects(): CardSelectorBuilder {
		this.__ignoreControlEffects = true
		return this
	}
}
