import CardTribe from '@shared/enums/CardTribe'
import BuffContainer from '@shared/models/BuffContainer'
import BuffContainerMessage from '@shared/models/network/buffContainer/BuffContainerMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import RenderedBuff from '@/Pixi/models/buffs/RenderedBuff'
import { arrayShallowMatch } from '@/utils/Utils'

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
		const startingTribes = this.parent instanceof RenderedCard ? this.parent.tribes : []
		this.buffs.push(buff)
		this.updateParentAfterBuffChange(startingTribes)
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
		const startingTribes = this.parent instanceof RenderedCard ? this.parent.tribes : []
		this.buffs.splice(this.buffs.indexOf(buff), 1)
		this.updateParentAfterBuffChange(startingTribes)
	}

	private updateParentAfterBuffChange(previousTribes: CardTribe[]): void {
		if (!(this.parent instanceof RenderedCard)) {
			return
		}

		this.parent.updateCardDescription()
		this.parent.updatePowerTextColors()
		if (!arrayShallowMatch(previousTribes, this.parent.tribes)) {
			this.parent.updateCardTribes()
		}
		Core.player.players.forEach((player) => {
			if (this.parent instanceof RenderedCard && player.cardHand.unitCards.includes(this.parent)) {
				player.cardHand.sortCards()
			}
		})
	}
}
