import BuffContainer from '@shared/models/BuffContainer'
import ServerBuff, { BuffConstructorParams } from './ServerBuff'
import ServerCard from './ServerCard'
import OutgoingCardUpdateMessages from '../handlers/outgoing/OutgoingCardUpdateMessages'
import ServerGame from './ServerGame'
import GameEventCreators from './events/GameEventCreators'
import ServerAnimation from './ServerAnimation'
import BuffFeature from '@shared/enums/BuffFeature'
import CardLocation from '@shared/enums/CardLocation'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { LeaderStatValueGetter } from '../../utils/LeaderStats'
import { CardSelector } from './events/selectors/CardSelector'

export interface BuffConstructor {
	new (params: BuffConstructorParams): ServerBuff
}

export default class ServerBuffContainer implements BuffContainer {
	readonly card: ServerCard
	readonly buffs: ServerBuff[]

	constructor(card: ServerCard) {
		this.card = card
		this.buffs = []
	}

	public get game(): ServerGame {
		return this.card.game
	}

	public get dispellable(): ServerBuff[] {
		return this.buffs.filter((buff) => !buff.protected)
	}

	/*
	 * Duration ticks down at the end of every turn:
	 * - Duration 1 = 'until the end of this turn'
	 * - Duration 2 = 'until the start of your next turn'
	 * Default value is Infinity, i.e. buffs never expire
	 */
	public add(prototype: BuffConstructor, source: ServerCard | null, duration: number | 'default' = 'default'): void {
		const newBuff = new prototype({
			card: this.card,
			source,
			duration,
			selector: null,
		})
		this.addInstance(newBuff, source)
	}

	public addMultiple(
		prototype: BuffConstructor,
		count: number | LeaderStatValueGetter,
		source: ServerCard | null,
		duration: number | 'default' = 'default'
	): void {
		if (typeof count === 'function') {
			count = count(source)
		}
		for (let i = 0; i < count; i++) {
			const newBuff = new prototype({
				card: this.card,
				source,
				duration,
				selector: null,
			})
			if (!this.buffSkipsAnimation(newBuff)) {
				this.game.animation.createAnimationThread()
			}
			this.addInstance(newBuff, source)
			if (!this.buffSkipsAnimation(newBuff)) {
				this.game.animation.commitAnimationThread()
			}
		}
	}

	public addForSelector(prototype: BuffConstructor, count: number, source: ServerCard | null, selector: CardSelector): void {
		for (let i = 0; i < count; i++) {
			const newBuff = new prototype({
				card: this.card,
				source,
				selector,
				duration: 'default',
			})
			if (!this.buffSkipsAnimation(newBuff)) {
				this.game.animation.createAnimationThread()
			}
			this.addInstance(newBuff, source)
			if (!this.buffSkipsAnimation(newBuff)) {
				this.game.animation.commitAnimationThread()
			}
		}
	}

	private buffSkipsAnimation(buff: ServerBuff): boolean {
		return buff.buffFeatures.includes(BuffFeature.SKIP_ANIMATION) || this.card.location === CardLocation.UNKNOWN
	}

	private addInstance(newBuff: ServerBuff, source: ServerCard | null): void {
		if (source && !this.buffSkipsAnimation(newBuff) && this.card.isVisuallyRendered) {
			this.game.animation.play(ServerAnimation.cardAffectsCards(source, [this.card]))
		}

		this.buffs.push(newBuff)
		OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(this.card, newBuff)

		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)

		this.game.events.postEvent(
			GameEventCreators.buffCreated({
				triggeringBuff: newBuff,
			})
		)

		if (this.buffSkipsAnimation(newBuff) || !this.card.isVisuallyRendered) {
			return
		}
		this.game.animation.play(ServerAnimation.cardsReceivedBuff([this.card], newBuff.alignment))
	}

	public getBuffsByPrototype(prototype: BuffConstructor): ServerBuff[] {
		const buffClass = prototype.prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.prototype.constructor.name.substr(1)
		return this.buffs.filter((buff) => buff.class === buffClass)
	}

	public has(prototype: BuffConstructor): boolean {
		return this.getIntensity(prototype) > 0
	}

	public getIntensity(prototype: BuffConstructor): number {
		return this.getBuffsByPrototype(prototype).length
	}

	public getIntensityForSelector(prototype: BuffConstructor, selector: CardSelector): number {
		return this.getBuffsByPrototype(prototype).filter((buff) => buff.selector === selector).length
	}

	public dispel(count: number): void {
		this.dispellable
			.reverse()
			.slice(0, count)
			.forEach((buff) => this.removeByReference(buff))
	}

	public removeByReference(buff: ServerBuff): void {
		const index = this.buffs.indexOf(buff)
		if (index === -1) {
			return
		}

		this.buffs.splice(index, 1)
		OutgoingCardUpdateMessages.notifyAboutCardBuffRemoved(this.card, buff)
		OutgoingCardUpdateMessages.notifyAboutCardStatsChange(this.card)
		this.game.events.unsubscribe(buff)
	}

	public removeBySelector(prototype: BuffConstructor, selector: CardSelector, count = Infinity): void {
		const buffClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)

		let stacksLeftToRemove = count
		let buffsOfType = this.buffs
			.filter((buff) => buff.class === buffClass)
			.filter((buff) => buff.selector === selector)
			.reverse()
		while (buffsOfType.length > 0 && stacksLeftToRemove > 0) {
			const buff = buffsOfType[0]
			stacksLeftToRemove -= 1
			this.removeByReference(buff)

			buffsOfType = this.buffs
				.filter((buff) => buff.class === buffClass)
				.filter((buff) => buff.selector === selector)
				.reverse()
		}
	}

	public removeAll(prototype: BuffConstructor): void {
		const buffClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		const buffsOfType = this.buffs.filter((buff) => buff.class === buffClass)
		buffsOfType.forEach((buffToRemove) => {
			this.removeByReference(buffToRemove)
		})
	}

	public removeAllByCardSelector(selector: CardSelector): void {
		this.buffs.filter((buff) => buff.selector === selector).forEach((buff) => this.removeByReference(buff))
	}

	public removeAllDispellable(): void {
		this.dispellable.forEach((buff) => this.removeByReference(buff))
	}
}
