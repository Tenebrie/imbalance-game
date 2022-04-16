import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardLocation from '@shared/enums/CardLocation'
import BuffContainer from '@shared/models/BuffContainer'
import OutgoingBoardUpdateMessages from '@src/game/handlers/outgoing/OutgoingBoardUpdateMessages'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'
import { getClassFromConstructor } from '@src/utils/Utils'

import OutgoingCardUpdateMessages from '../../handlers/outgoing/OutgoingCardUpdateMessages'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import GameEventCreators from '../events/GameEventCreators'
import { CardSelector } from '../events/selectors/CardSelector'
import ServerAnimation from '../ServerAnimation'
import ServerBoardRow from '../ServerBoardRow'
import ServerCard from '../ServerCard'
import ServerGame from '../ServerGame'
import ServerBuff, {
	BuffConstructorParams,
	ServerCardBuff,
	ServerRowBuff,
	ServerStackableCardBuff,
	ServerStackableRowBuff,
} from './ServerBuff'

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
		return this.buffs.filter((buff) => !buff.buffFeatures.includes(BuffFeature.INVISIBLE))
	}

	public playerDispellable(forGroup: ServerPlayerGroup): ServerBuff[] {
		const owner = this.parent instanceof ServerCard ? this.parent.ownerGroup : this.parent.owner
		const isAlly = owner === forGroup
		const isEnemy = owner !== forGroup
		return this.buffs.filter(
			(buff) =>
				!buff.protected &&
				!buff.buffFeatures.includes(BuffFeature.INVISIBLE) &&
				!(buff instanceof ServerStackableCardBuff) &&
				!(buff instanceof ServerStackableRowBuff) &&
				((isAlly && buff.alignment !== BuffAlignment.POSITIVE) || (isEnemy && buff.alignment !== BuffAlignment.NEGATIVE))
		)
	}

	public anyDispellable(): ServerBuff[] {
		return this.buffs.filter(
			(buff) =>
				!buff.protected &&
				!buff.buffFeatures.includes(BuffFeature.INVISIBLE) &&
				!(buff instanceof ServerStackableCardBuff) &&
				!(buff instanceof ServerStackableRowBuff)
		)
	}

	public get systemDispellable(): ServerBuff[] {
		return this.buffs.filter((buff) => !buff.protected)
	}

	/*
	 * Duration ticks down at the end of every turn:
	 * - Duration 1 = 'until the end of this turn'
	 * - Duration 2 = 'until the start of your next turn'
	 * Default value is Infinity, i.e. buffs never expire
	 */
	public add(prototype: BuffConstructor, source: ServerBuffSource | null, duration: number | 'default' = 'default'): ServerBuff {
		const newBuff = new prototype({
			parent: this.parent,
			source,
			duration,
			selector: null,
		})
		return this.addInstance(newBuff, source)
	}

	public addMultiple(
		prototype: BuffConstructor,
		count: number | LeaderStatValueGetter,
		source: ServerBuffSource | null,
		duration: number | 'default' = 'default',
		mergeAnimation = false
	): ServerBuff[] {
		if (typeof count === 'function') {
			count = count(source)
		}
		if (count <= 0) {
			return []
		}

		const buffs = []
		for (let i = 0; i < count; i++) {
			const newBuff = new prototype({
				parent: this.parent,
				source,
				duration,
				selector: null,
			})
			if (!this.buffSkipsAnimation(newBuff) && !mergeAnimation) {
				this.game.animation.createAnimationThread()
			}
			const addedBuff = this.addInstance(newBuff, source, mergeAnimation)
			buffs.push(addedBuff)
			if (!this.buffSkipsAnimation(newBuff) && !mergeAnimation) {
				this.game.animation.commitAnimationThread()
			}
		}

		const exampleBuff = buffs[0]

		if (exampleBuff instanceof ServerCardBuff) {
			this.game.events.postEvent(
				GameEventCreators.cardMultibuffCreated({
					game: this.game,
					triggeringBuff: exampleBuff,
					affectedBuffs: buffs as ServerCardBuff[],
					source,
				})
			)
		}

		if (!this.buffSkipsAnimation(exampleBuff) && mergeAnimation) {
			if (this.parent instanceof ServerCard && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.cardsReceivedBuff([this.parent], exampleBuff.alignment))
			} else if (this.parent instanceof ServerBoardRow) {
				this.game.animation.play(ServerAnimation.rowsReceivedBuff([this.parent], exampleBuff.alignment))
			}
		}
		return buffs
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

	private addInstance(newBuff: ServerBuff, source: ServerBuffSource, skipAnimation = false): ServerBuff {
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
			this.removeAllSystemDispellable({ skipAnimation: true })
		}

		let isBuffStacking = false
		const duplicatedBuff = this.buffs.find((buff) => buff.class === newBuff.class)
		if (
			duplicatedBuff &&
			duplicatedBuff instanceof ServerStackableCardBuff &&
			duplicatedBuff.selector === null &&
			newBuff.selector === null
		) {
			duplicatedBuff.stacks += 1
			isBuffStacking = true
		} else {
			this.buffs.push(newBuff)
		}

		if (newBuff instanceof ServerCardBuff) {
			OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(newBuff)
			this.game.events.postEvent(
				GameEventCreators.cardBuffCreated({
					game: this.game,
					triggeringBuff: newBuff,
					source,
				})
			)
		} else if (newBuff instanceof ServerRowBuff) {
			OutgoingBoardUpdateMessages.notifyAboutRowBuffAdded(newBuff)
			this.game.events.postEvent(
				GameEventCreators.rowBuffCreated({
					game: this.game,
					triggeringBuff: newBuff,
					source,
				})
			)
		}

		if (isBuffStacking) {
			this.game.events.unsubscribe(newBuff)
		}

		if (this.parent instanceof ServerCard) {
			OutgoingMessageHandlers.notifyAboutCardStatsChange(this.parent)
		}

		if (!this.buffSkipsAnimation(newBuff) && !skipAnimation) {
			if (this.parent instanceof ServerCard && this.parent.isVisuallyRendered) {
				this.game.animation.play(ServerAnimation.cardsReceivedBuff([this.parent], newBuff.alignment))
			} else if (this.parent instanceof ServerBoardRow) {
				this.game.animation.play(ServerAnimation.rowsReceivedBuff([this.parent], newBuff.alignment))
			}
		}
		return isBuffStacking && duplicatedBuff ? duplicatedBuff : newBuff
	}

	public getBuffsByPrototype(prototype: BuffConstructor): ServerBuff[] {
		const buffClass = prototype.prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.prototype.constructor.name.substr(1)
		return this.buffs.filter((buff) => buff.class === buffClass)
	}

	public has(prototype: BuffConstructor): boolean {
		return this.getIntensity(prototype) > 0
	}

	public hasExact(buff: ServerBuff): boolean {
		return this.buffs.some((existingBuff) => existingBuff.id === buff.id)
	}

	public getIntensity(prototype: BuffConstructor): number {
		return this.getBuffsByPrototype(prototype)
			.map((buff) => (buff instanceof ServerStackableCardBuff || buff instanceof ServerStackableRowBuff ? buff.stacks : 1))
			.reduce((total, value) => total + value, 0)
	}

	public getIntensityForSelector(prototype: BuffConstructor, selector: CardSelector): number {
		return this.getBuffsByPrototype(prototype)
			.filter((buff) => buff.selector === selector)
			.map((buff) => (buff instanceof ServerStackableCardBuff || buff instanceof ServerStackableRowBuff ? buff.stacks : 1))
			.reduce((total, value) => total + value, 0)
	}

	public dispel(forGroup: ServerPlayerGroup, count: number): void {
		this.playerDispellable(forGroup)
			.reverse()
			.slice(0, count)
			.forEach((buff) => this.removeByReference(buff))
	}

	public removeByReference(buff: ServerBuff, args?: { source?: ServerBuffSource; skipAnimation?: boolean }): void {
		const index = this.buffs.indexOf(buff)
		if (index === -1) {
			return
		}
		const source = args?.source || null
		const skipAnimation = args?.skipAnimation || null

		if (!this.buffSkipsAnimation(buff) && !skipAnimation) {
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
				source,
			})
		} else if (buff instanceof ServerRowBuff) {
			this.game.events.postEvent(
				GameEventCreators.rowBuffRemoved({
					game: this.game,
					triggeringBuff: buff,
					source,
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
		const buffClass = getClassFromConstructor(prototype)

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

	public removeAll(prototype: BuffConstructor, source: ServerBuffSource): void {
		const buffClass = getClassFromConstructor(prototype)
		const buffsOfType = this.buffs.filter((buff) => buff.class === buffClass)
		if (buffsOfType.length === 0) {
			return
		}

		if (source && !this.buffSkipsAnimation(buffsOfType[0])) {
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

		buffsOfType.forEach((buffToRemove) => {
			this.removeByReference(buffToRemove, {
				skipAnimation: false,
				source,
			})
		})
	}

	public removeAllByCardSelector(selector: CardSelector): void {
		this.buffs.filter((buff) => buff.selector === selector).forEach((buff) => this.removeByReference(buff))
	}

	public removeAllSystemDispellable(args: { skipAnimation: boolean } = { skipAnimation: false }): void {
		this.systemDispellable.forEach((buff) => this.removeByReference(buff, args))
	}
}
