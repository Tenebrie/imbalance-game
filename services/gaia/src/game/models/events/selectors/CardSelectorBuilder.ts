import { ValueGetter } from '@src/utils/LeaderStats'

import { BuffConstructor } from '../../buffs/ServerBuffContainer'
import ServerGame from '../../ServerGame'
import { EventSubscriber } from '../../ServerGameEvents'
import { CardSelector, CardSelectorArgs } from './CardSelector'
import { CardSelectorProvideBuff } from './CardSelectorProvideBuff'

export class CardSelectorBuilder {
	private readonly __subscriber: EventSubscriber
	private readonly __selfConditions: (() => boolean)[]
	private readonly __targetConditions: ((args: CardSelectorArgs) => boolean)[]
	private readonly __provideBuffs: CardSelectorProvideBuff[]
	private readonly __provideSelfBuffs: CardSelectorProvideBuff[]
	private readonly __onSelectCallbacks: ((args: CardSelectorArgs) => void)[]
	private readonly __onReleaseCallbacks: ((args: CardSelectorArgs) => void)[]
	private __ignoreControlEffects = false

	constructor(subscriber: EventSubscriber) {
		this.__subscriber = subscriber
		this.__selfConditions = []
		this.__targetConditions = []
		this.__provideBuffs = []
		this.__provideSelfBuffs = []
		this.__onSelectCallbacks = []
		this.__onReleaseCallbacks = []
	}

	public _build(game: ServerGame): CardSelector {
		return new CardSelector(
			game,
			this.__subscriber,
			this.__selfConditions,
			this.__targetConditions,
			this.__provideBuffs,
			this.__provideSelfBuffs,
			this.__onSelectCallbacks,
			this.__onReleaseCallbacks,
			this.__ignoreControlEffects
		)
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

	/* Provide the selected target with a buff
	 * ---------------------------------------
	 * While the selector is true, the target card will have the specified buff.
	 * The buff will also be non-dispellable.
	 */
	public provide(buff: BuffConstructor, count: number | ValueGetter = 1): CardSelectorBuilder {
		this.__provideBuffs.push({ buff, count })
		return this
	}

	/* Provide self with a buff
	 * ---------------------------------------
	 * While the selector is true, this card will have the specified buff.
	 * The buff will also be non-dispellable.
	 */
	public provideSelf(buff: BuffConstructor, count: number | ValueGetter = 1): CardSelectorBuilder {
		this.__provideSelfBuffs.push({ buff, count })
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
