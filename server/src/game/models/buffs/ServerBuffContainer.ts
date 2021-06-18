import BuffContainer from '@shared/models/BuffContainer'
import ServerBuff, { BuffConstructorParams, ServerCardBuff, ServerRowBuff } from './ServerBuff'
import ServerCard from '../ServerCard'
import OutgoingCardUpdateMessages from '../../handlers/outgoing/OutgoingCardUpdateMessages'
import ServerGame from '../ServerGame'
import GameEventCreators from '../events/GameEventCreators'
import ServerAnimation from '../ServerAnimation'
import BuffFeature from '@shared/enums/BuffFeature'
import CardLocation from '@shared/enums/CardLocation'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'
import { CardSelector } from '../events/selectors/CardSelector'
import ServerBoardRow from '../ServerBoardRow'
import OutgoingBoardUpdateMessages from '@src/game/handlers/outgoing/OutgoingBoardUpdateMessages'

export interface BuffConstructor {
	new (params: BuffConstructorParams): ServerBuff
}

export type ServerBuffParent = ServerCard | ServerBoardRow
export type ServerBuffSource = ServerCard | ServerBoardRow | null

export default class ServerBuffContainer implements BuffContainer {
	readonly parent: ServerBuffParent
	readonly buffs: ServerBuff[]

	constructor(owner: ServerCard | ServerBoardRow) {
		this.parent = owner
		this.buffs = []
	}

	public get game(): ServerGame {
		return this.parent.game
	}

	public get visible(): ServerBuff[] {
		return this.buffs.filter((buff) => !buff.buffFeatures.includes(BuffFeature.SERVICE_BUFF))
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
			parent: this.parent,
			source,
			duration,
			selector: null,
		})
		this.addInstance(newBuff, source)
	}

	public addMultiple(
		prototype: BuffConstructor,
		count: number | LeaderStatValueGetter,
		source: ServerBuffSource | null,
		duration: number | 'default' = 'default'
	): void {
		if (typeof count === 'function') {
			count = count(source)
		}
		for (let i = 0; i < count; i++) {
			const newBuff = new prototype({
				parent: this.parent,
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

	public addForSelector(prototype: BuffConstructor, count: number, source: ServerBuffParent | null, selector: CardSelector): void {
		for (let i = 0; i < count; i++) {
			const newBuff = new prototype({
				parent: this.parent,
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
		return (
			buff.buffFeatures.includes(BuffFeature.SKIP_ANIMATION) ||
			(this.parent instanceof ServerCard && this.parent.location === CardLocation.UNKNOWN)
		)
	}

	private addInstance(newBuff: ServerBuff, source: ServerBuffSource): void {
		if (source && !this.buffSkipsAnimation(newBuff)) {
			if (this.parent instanceof ServerCard && source instanceof ServerCard && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.cardAffectsCards(source, [this.parent]))
			} else if (this.parent instanceof ServerBoardRow && source instanceof ServerCard) {
				this.game.animation.play(ServerAnimation.cardAffectsRows(source, [this.parent]))
			} else if (this.parent instanceof ServerCard && source instanceof ServerBoardRow && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.rowAffectsCards(source, [this.parent]))
			} else if (this.parent instanceof ServerBoardRow && source instanceof ServerBoardRow) {
				this.game.animation.play(ServerAnimation.rowAffectsRows(source, [this.parent]))
			}
		}

		if (this.parent instanceof ServerBoardRow) {
			this.removeAllDispellable({ skipAnimation: true })
		}

		this.buffs.push(newBuff)

		if (newBuff instanceof ServerCardBuff) {
			OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(newBuff)
			this.game.events.postEvent(
				GameEventCreators.cardBuffCreated({
					game: this.game,
					triggeringBuff: newBuff,
				})
			)
		} else if (newBuff instanceof ServerRowBuff) {
			OutgoingBoardUpdateMessages.notifyAboutRowBuffAdded(newBuff)
			this.game.events.postEvent(
				GameEventCreators.rowBuffCreated({
					game: this.game,
					triggeringBuff: newBuff,
				})
			)
		}

		if (this.parent instanceof ServerCard) {
			OutgoingMessageHandlers.notifyAboutCardStatsChange(this.parent)
		}

		if (!this.buffSkipsAnimation(newBuff)) {
			if (this.parent instanceof ServerCard && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.cardsReceivedBuff([this.parent], newBuff.alignment))
			} else if (this.parent instanceof ServerBoardRow) {
				this.game.animation.play(ServerAnimation.rowsReceivedBuff([this.parent], newBuff.alignment))
			}
		}
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

	public removeByReference(buff: ServerBuff, args: { skipAnimation: boolean } = { skipAnimation: false }): void {
		const index = this.buffs.indexOf(buff)
		if (index === -1) {
			return
		}

		if (!this.buffSkipsAnimation(buff) && !args.skipAnimation) {
			if (this.parent instanceof ServerCard && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.cardsLostBuff([this.parent], buff.alignment))
			} else if (this.parent instanceof ServerBoardRow) {
				this.game.animation.play(ServerAnimation.rowsLostBuff([this.parent], buff.alignment))
			}
		}

		if (buff instanceof ServerCardBuff) {
			GameEventCreators.cardBuffRemoved({
				game: this.game,
				triggeringBuff: buff,
			})
		} else if (buff instanceof ServerRowBuff) {
			this.game.events.postEvent(
				GameEventCreators.rowBuffRemoved({
					game: this.game,
					triggeringBuff: buff,
				})
			)
		}

		this.buffs.splice(index, 1)
		if (buff instanceof ServerCardBuff) {
			OutgoingCardUpdateMessages.notifyAboutCardBuffRemoved(buff)
		} else if (buff instanceof ServerRowBuff) {
			OutgoingBoardUpdateMessages.notifyAboutRowBuffRemoved(buff)
		}
		if (this.parent instanceof ServerCard) {
			OutgoingCardUpdateMessages.notifyAboutCardStatsChange(this.parent)
		}
		this.game.events.unsubscribe(buff)
		this.game.index.removeBuff(buff)
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

	public removeAllDispellable(args: { skipAnimation: boolean } = { skipAnimation: false }): void {
		this.dispellable.forEach((buff) => this.removeByReference(buff, args))
	}
}
