import BuffContainer from '@shared/models/BuffContainer'
import ServerBuff from './ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerCard from './ServerCard'
import OutgoingCardUpdateMessages from '../handlers/outgoing/OutgoingCardUpdateMessages'
import ServerGame from './ServerGame'
import GameEventCreators from './GameEventCreators'
import ServerAnimation from './ServerAnimation'
import BuffFeature from '@shared/enums/BuffFeature'
import CardLocation from '@shared/enums/CardLocation'

export interface BuffConstructor {
	new (game: ServerGame): ServerBuff
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

	private instantiate(prototype: BuffConstructor, source: ServerCard | null): ServerBuff {
		const buff = new prototype(this.card.game)
		const buffClass = buff.constructor.name.substr(0, 1).toLowerCase() + buff.constructor.name.substr(1)

		buff.name = `buff.${buffClass}.name`
		buff.description = `buff.${buffClass}.description`
		buff.card = this.card
		buff.game = this.card.game
		buff.source = source
		buff.duration = buff.baseDuration
		buff.intensity = buff.baseIntensity
		buff.buffClass = buffClass

		return buff
	}

	/*
	 * Duration ticks down at the end of every turn:
	 * - Duration 1 = 'until the end of this turn'
	 * - Duration 2 = 'until the start of your next turn'
	 * Default value is Infinity, i.e. buffs never expire
	 */
	public add(prototype: BuffConstructor, source: ServerCard | null, duration: number | 'default' = 'default'): void {
		const newBuff = this.instantiate(prototype, source)
		if (duration !== 'default') {
			newBuff.duration = duration
		}

		const playBuffReceivedAnimation = () => {
			if (newBuff.buffFeatures.includes(BuffFeature.SKIP_ANIMATION) || this.card.location === CardLocation.UNKNOWN) {
				return
			}
			this.game.animation.play(ServerAnimation.cardsReceivedBuff([this.card], newBuff.alignment))
		}

		if (source && this.card.location !== CardLocation.UNKNOWN) {
			this.game.animation.play(ServerAnimation.cardAffectsCards(source, [this.card]))
		}

		let invokedBuff = newBuff

		const existingBuff = this.buffs.find(existingBuff => existingBuff.buffClass === newBuff.buffClass)

		if (newBuff.stackType === BuffStackType.NONE && existingBuff && existingBuff.duration < newBuff.duration) {
			this.buffs.splice(this.buffs.indexOf(existingBuff), 1)
			OutgoingCardUpdateMessages.notifyAboutCardBuffRemoved(this.card, existingBuff)
			this.buffs.push(newBuff)
			OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(this.card, newBuff)
		}

		if (newBuff.stackType === BuffStackType.OVERLAY || !existingBuff) {
			this.buffs.push(newBuff)
			OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(this.card, newBuff)
		}

		if (existingBuff && newBuff.stackType === BuffStackType.ADD_DURATION) {
			this.game.events.unsubscribe(newBuff)
			existingBuff.setDuration(existingBuff.duration + newBuff.duration)
			invokedBuff = existingBuff
		}

		if (existingBuff && newBuff.stackType === BuffStackType.ADD_INTENSITY) {
			this.game.events.unsubscribe(newBuff)
			existingBuff.setIntensity(existingBuff.intensity + 1)
			playBuffReceivedAnimation()
			return
		}

		this.game.events.postEvent(GameEventCreators.buffCreated({
			triggeringBuff: invokedBuff
		}))

		playBuffReceivedAnimation()
	}

	public addMultiple(prototype: BuffConstructor, count: number, source: ServerCard | null, duration: number | 'default' = 'default'): void {
		for (let i = 0; i < count; i++) {
			this.game.animation.createAnimationThread()
			this.add(prototype, source, duration)
			this.game.animation.commitAnimationThread()
		}
	}

	public getBuffsByPrototype(prototype: BuffConstructor): ServerBuff[] {
		const buffClass = prototype.prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.prototype.constructor.name.substr(1)
		return this.buffs.filter(buff => buff.buffClass === buffClass)
	}

	public has(prototype: BuffConstructor): boolean {
		return this.getBuffsByPrototype(prototype).length > 0
	}

	public getIntensity(prototype: BuffConstructor): number {
		return this.getBuffsByPrototype(prototype).map(buff => buff.intensity).reduce((total, value) => total + value, 0)
	}

	public removeByReference(buff: ServerBuff): void {
		const index = this.buffs.indexOf(buff)
		if (index === -1) {
			return
		}

		this.buffs.splice(index, 1)
		buff.setIntensity(0)
		OutgoingCardUpdateMessages.notifyAboutCardBuffRemoved(this.card, buff)
		this.game.events.unsubscribe(buff)
	}

	public remove(prototype: BuffConstructor): void {
		const buffClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		const buffsOfType = this.buffs.filter(buff => buff.buffClass === buffClass)
		buffsOfType.forEach(buffToRemove => {
			this.removeByReference(buffToRemove)
		})
	}

	public removeAll(): void {
		while (this.buffs.length > 0) {
			this.removeByReference(this.buffs[0])
		}
	}
}
