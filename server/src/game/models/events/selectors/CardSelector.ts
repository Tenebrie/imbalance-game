import { EventSubscriber } from '../../ServerGameEvents'
import ServerCard from '../../ServerCard'
import ServerGame from '../../ServerGame'
import { CardSelectorProvideBuff } from './CardSelectorProvideBuff'
import ServerBuff from '../../ServerBuff'
import { cardPerform } from '../../../utils/CardEventHandlers'

export type CardSelectorArgs = {
	target: ServerCard
}

export class CardSelector {
	public readonly subscriber: EventSubscriber
	public readonly ignoreControlEffects

	private readonly selfConditions: (() => boolean)[]
	private readonly targetConditions: ((args: CardSelectorArgs) => boolean)[]
	private readonly provideBuffs: CardSelectorProvideBuff[]
	private readonly provideSelfBuffs: CardSelectorProvideBuff[]
	private readonly onSelectCallbacks: ((args: CardSelectorArgs) => void)[]
	private readonly onReleaseCallbacks: ((args: CardSelectorArgs) => void)[]

	private selectedCards: ServerCard[] = []

	constructor(
		subscriber: EventSubscriber,
		selfConditions: (() => boolean)[],
		targetConditions: ((args: CardSelectorArgs) => boolean)[],
		provideBuffs: CardSelectorProvideBuff[],
		provideSelfBuffs: CardSelectorProvideBuff[],
		onSelectCallbacks: ((args: CardSelectorArgs) => void)[],
		onReleaseCallbacks: ((args: CardSelectorArgs) => void)[],
		ignoreControlEffects: boolean
	) {
		this.subscriber = subscriber
		this.selfConditions = selfConditions
		this.targetConditions = targetConditions
		this.provideBuffs = provideBuffs
		this.provideSelfBuffs = provideSelfBuffs
		this.onSelectCallbacks = onSelectCallbacks
		this.onReleaseCallbacks = onReleaseCallbacks
		this.ignoreControlEffects = ignoreControlEffects
	}

	private get game(): ServerGame {
		return this.subscriber instanceof ServerGame ? this.subscriber : this.subscriber.game
	}

	private get card(): ServerCard | null {
		return this.subscriber instanceof ServerCard ? this.subscriber : this.subscriber instanceof ServerBuff ? this.subscriber.card : null
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

		this.deselectCards(deselectedCards)

		newSelectedCards.forEach((card) => {
			this.game.animation.thread(() => {
				this.onSelectCallbacks.forEach((callback) => {
					cardPerform(this.game, () => callback({ target: card }))
				})
			})
		})

		this.selectedCards = this.selectedCards.concat(newSelectedCards).filter((card) => !deselectedCards.includes(card))

		this.provideBuffs.forEach((provideBuff) => {
			let intensityRequired: number
			if (typeof provideBuff.count === 'function') {
				intensityRequired = provideBuff.count(this.card)
			} else {
				intensityRequired = provideBuff.count
			}
			// Not enough stacks
			this.selectedCards
				.filter((card) => card.buffs.getIntensityForSelector(provideBuff.buff, this) < intensityRequired)
				.forEach((card) => {
					const currentIntensity = card.buffs.getIntensityForSelector(provideBuff.buff, this)
					card.buffs.addForSelector(provideBuff.buff, intensityRequired - currentIntensity, this.card, this)
				})
			// Too many stacks
			this.selectedCards
				.filter((card) => card.buffs.getIntensityForSelector(provideBuff.buff, this) > intensityRequired)
				.forEach((card) => {
					const currentIntensity = card.buffs.getIntensityForSelector(provideBuff.buff, this)
					card.buffs.removeBySelector(provideBuff.buff, this, currentIntensity - intensityRequired)
				})
		})

		const self = this.card
		if (!self) {
			return
		}

		this.provideSelfBuffs.forEach((provideBuff) => {
			let intensityRequired: number
			if (typeof provideBuff.count === 'function') {
				intensityRequired = provideBuff.count(this.card)
			} else {
				intensityRequired = provideBuff.count
			}
			intensityRequired *= this.selectedCards.length
			const currentIntensity = self.buffs.getIntensityForSelector(provideBuff.buff, this)
			if (currentIntensity < intensityRequired) {
				self.buffs.addForSelector(provideBuff.buff, intensityRequired - currentIntensity, this.card, this)
			} else if (currentIntensity > intensityRequired) {
				self.buffs.removeBySelector(provideBuff.buff, this, currentIntensity - intensityRequired)
			}
		})
	}

	public clearSelection(): void {
		this.game.animation.syncAnimationThreads()

		this.deselectCards(this.selectedCards)
		this.selectedCards = []
	}

	private deselectCards(cards: ServerCard[]): void {
		cards.forEach((card) => {
			this.game.animation.thread(() => {
				this.onReleaseCallbacks.forEach((callback) => cardPerform(this.game, () => callback({ target: card })))
			})
			this.game.animation.thread(() => {
				card.buffs.removeAllByCardSelector(this)
			})
		})
	}

	private __markedForRemoval = false
	public markForRemoval(): void {
		this.__markedForRemoval = true
	}
	public get markedForRemoval(): boolean {
		return this.__markedForRemoval
	}
}
