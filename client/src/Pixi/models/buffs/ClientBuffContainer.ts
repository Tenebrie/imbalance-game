import BuffContainer from '@shared/models/BuffContainer'
import BuffContainerMessage from '@shared/models/network/buffContainer/BuffContainerMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import RenderedBuff from '@/Pixi/models/buffs/RenderedBuff'

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
			Core.player.players.forEach((player) => {
				if (this.parent instanceof RenderedCard && player.cardHand.unitCards.includes(this.parent)) {
					player.cardHand.sortCards()
				}
			})
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
		if (buff instanceof RenderedBuff) {
			buff.destroySprite()
		}
		this.buffs.splice(this.buffs.indexOf(buff), 1)
		if (this.parent instanceof RenderedCard) {
			this.parent.updateCardDescription()
			Core.player.players.forEach((player) => {
				if (this.parent instanceof RenderedCard && player.cardHand.unitCards.includes(this.parent)) {
					player.cardHand.sortCards()
				}
			})
		}
	}
}
