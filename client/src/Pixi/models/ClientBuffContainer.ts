import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientBuff from '@/Pixi/models/ClientBuff'
import BuffContainer from '@shared/models/BuffContainer'
import Core from '@/Pixi/Core'
import BuffContainerMessage from '@shared/models/network/buffContainer/BuffContainerMessage'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'

export default class ClientBuffContainer implements BuffContainer {
	parent: RenderedCard | RenderedGameBoardRow
	buffs: ClientBuff[]

	public constructor(parent: RenderedCard | RenderedGameBoardRow, buffsMessage: BuffContainerMessage | null) {
		this.parent = parent
		this.buffs = []
		if (buffsMessage) {
			buffsMessage.buffs.forEach((buffMessage) => this.buffs.push(new ClientBuff(buffMessage)))
		}
	}

	public add(buff: ClientBuff): void {
		this.buffs.push(buff)
		if (this.parent instanceof RenderedCard) {
			this.parent.updateCardDescription()
			if (Core.player.cardHand.unitCards.includes(this.parent)) {
				Core.player.cardHand.sortCards()
			}
		}
	}

	public findBuffById(buffId: string): ClientBuff | null {
		return this.buffs.find((buff) => buff.id === buffId) || null
	}

	public removeById(id: string): void {
		const buff = this.findBuffById(id)
		if (!buff) {
			return
		}
		this.buffs.splice(this.buffs.indexOf(buff), 1)
		if (this.parent instanceof RenderedCard) {
			this.parent.updateCardDescription()
			if (Core.player.cardHand.unitCards.includes(this.parent)) {
				Core.player.cardHand.sortCards()
			}
		}
	}
}
