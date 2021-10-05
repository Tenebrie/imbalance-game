import { cardPerform } from '../../../utils/CardEventHandlers'
import ServerCard from '../../ServerCard'
import ServerGame from '../../ServerGame'
import { EventSubscriber } from '../../ServerGameEvents'
import { CardSelectorProvideBuff } from './CardSelectorProvideBuff'

export type CardSelectorArgs = {
	target: ServerCard
}

export class CardSelector {
	public readonly game: ServerGame
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
		game: ServerGame,
		subscriber: EventSubscriber,
		selfConditions: (() => boolean)[],
		targetConditions: ((args: CardSelectorArgs) => boolean)[],
		provideBuffs: CardSelectorProvideBuff[],
		provideSelfBuffs: CardSelectorProvideBuff[],
		onSelectCallbacks: ((args: CardSelectorArgs) => void)[],
		onReleaseCallbacks: ((args: CardSelectorArgs) => void)[],
		ignoreControlEffects: boolean
	) {
		this.game = game
		this.subscriber = subscriber
		this.selfConditions = selfConditions
		this.targetConditions = targetConditions
		this.provideBuffs = provideBuffs
		this.provideSelfBuffs = provideSelfBuffs
		this.onSelectCallbacks = onSelectCallbacks
		this.onReleaseCallbacks = onReleaseCallbacks
		this.ignoreControlEffects = ignoreControlEffects
	}

	public evaluate(allGameCards: ServerCard[]): void {
		this.game.animation.syncAnimationThreads()

		if (this.selfConditions.find((condition) => !condition())) {
			this.clearSelection()
			return
		}

		const deselectedCards = this.selectedCards.filter(
			(card) => !card.ownerGroupNullable || this.targetConditions.find((condition) => !condition({ target: card }))
		)
		// const deselectedCards = this.selectedCards.filter((card) => this.targetConditions.find((condition) => !condition({ target: card })))

		const newSelectedCards = allGameCards
			.filter((card) => !this.selectedCards.includes(card))
			.filter((card) => this.targetConditions.every((condition) => condition({ target: card })))

		this.deselectCards(deselectedCards)

		newSelectedCards.forEach((card) => {
			this.game.animation.thread(() => {
				this.onSelectCallbacks.forEach((callback) => {
					cardPerform(this.game, card, () => callback({ target: card }))
				})
			})
		})

		this.selectedCards = this.selectedCards.concat(newSelectedCards).filter((card) => !deselectedCards.includes(card))

		this.provideBuffs.forEach((provideBuff) => {
			let intensityRequired: number
			if (typeof provideBuff.count === 'function') {
				intensityRequired = provideBuff.count(this.subscriber)
			} else {
				intensityRequired = provideBuff.count
			}
			// Not enough stacks
			this.selectedCards
				.filter((card) => card.buffs.getIntensityForSelector(provideBuff.buff, this) < intensityRequired)
				.forEach((card) => {
					const currentIntensity = card.buffs.getIntensityForSelector(provideBuff.buff, this)
					const source = this.subscriber === null ? null : this.subscriber instanceof ServerCard ? this.subscriber : this.subscriber.parent
					card.buffs.addForSelector(provideBuff.buff, intensityRequired - currentIntensity, source, this)
				})
			// Too many stacks
			this.selectedCards
				.filter((card) => card.buffs.getIntensityForSelector(provideBuff.buff, this) > intensityRequired)
				.forEach((card) => {
					const currentIntensity = card.buffs.getIntensityForSelector(provideBuff.buff, this)
					card.buffs.removeBySelector(provideBuff.buff, this, currentIntensity - intensityRequired)
				})
		})

		const self = this.subscriber
		if (!self || !(self instanceof ServerCard)) {
			return
		}

		this.provideSelfBuffs.forEach((provideBuff) => {
			let intensityRequired: number
			if (typeof provideBuff.count === 'function') {
				intensityRequired = provideBuff.count(self)
			} else {
				intensityRequired = provideBuff.count
			}
			intensityRequired *= this.selectedCards.length
			const currentIntensity = self.buffs.getIntensityForSelector(provideBuff.buff, this)
			if (currentIntensity < intensityRequired) {
				const source = this.subscriber === null ? null : this.subscriber instanceof ServerCard ? this.subscriber : this.subscriber.parent
				self.buffs.addForSelector(provideBuff.buff, intensityRequired - currentIntensity, source, this)
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
				this.onReleaseCallbacks.forEach((callback) => cardPerform(this.game, card, () => callback({ target: card })))
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
