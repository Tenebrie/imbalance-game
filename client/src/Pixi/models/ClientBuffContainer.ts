import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientBuff from '@/Pixi/models/ClientBuff'
import BuffContainer from '@shared/models/BuffContainer'
import BuffContainerMessage from '@shared/models/network/BuffContainerMessage'
import BuffMessage from '@shared/models/network/BuffMessage'
import Core from '@/Pixi/Core'

export default class ClientBuffContainer implements BuffContainer {
	card: RenderedCard
	buffs: ClientBuff[]

	public constructor(card: RenderedCard, buffsMessage: BuffContainerMessage) {
		this.card = card
		this.buffs = []
		buffsMessage.buffs.forEach(buffMessage => this.buffs.push(new ClientBuff(buffMessage)))
	}

	public add(buff: ClientBuff): void {
		this.buffs.push(buff)
		if (Core.player.cardHand.unitCards.includes(this.card)) {
			Core.player.cardHand.sortCards()
		}
	}

	public findBuffById(buffId: string): ClientBuff {
		return this.buffs.find(buff => buff.id === buffId)
	}

	public getBuffsByPrototype(prototype: any): ClientBuff[] {
		const buffClass = prototype.prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.prototype.constructor.name.substr(1)
		return this.buffs.filter(buff => buff.buffClass === buffClass)
	}

	public has(prototype: any): boolean {
		return this.getBuffsByPrototype(prototype).length > 0
	}

	public getIntensity(prototype: any): number {
		return this.getBuffsByPrototype(prototype).map(buff => buff.intensity).reduce((total, value) => total + value, 0)
	}

	public remove(buffMessage: BuffMessage): void {
		this.buffs.splice(this.buffs.indexOf(this.findBuffById(buffMessage.id)), 1)
		if (Core.player.cardHand.unitCards.includes(this.card)) {
			Core.player.cardHand.sortCards()
		}
	}
}
