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
		this.card.updateCardDescription()
		if (Core.player.cardHand.unitCards.includes(this.card)) {
			Core.player.cardHand.sortCards()
		}
	}

	public findBuffById(buffId: string): ClientBuff {
		return this.buffs.find(buff => buff.id === buffId)
	}

	public remove(buffMessage: BuffMessage): void {
		this.buffs.splice(this.buffs.indexOf(this.findBuffById(buffMessage.id)), 1)
		this.card.updateCardDescription()
		if (Core.player.cardHand.unitCards.includes(this.card)) {
			Core.player.cardHand.sortCards()
		}
	}
}
