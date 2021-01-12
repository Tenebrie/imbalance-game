import ServerBuff from '@src/game/models/ServerBuff'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import CardLibrary from '@src/game/libraries/CardLibrary'

export default class ServerGameIndex {
	public readonly game: ServerGame
	public readonly buffIndex: Map<string, ServerBuff> = new Map<string, ServerBuff>()
	public readonly cardIndex: Map<string, ServerCard> = new Map<string, ServerCard>()

	constructor(game: ServerGame) {
		this.game = game
		CardLibrary?.cards.forEach((card) => {
			this.addCard(card)
		})
	}

	public addBuff(buff: ServerBuff): void {
		this.buffIndex.set(buff.id.split(':')[2], buff)
	}

	public addCard(card: ServerCard): void {
		this.cardIndex.set(card.id.split(':')[2], card)
	}

	public findBuff(id: string): ServerBuff | null {
		if (id.includes(':')) {
			id = id.split(':')[2]
		}
		return this.buffIndex.get(id) || null
	}

	public findCard(id: string): ServerCard | null {
		if (id.includes(':')) {
			id = id.split(':')[2]
		}
		return this.cardIndex.get(id) || null
	}

	public removeBuff(buff: ServerBuff): void {
		this.buffIndex.delete(buff.id.split(':')[2])
	}

	public removeCard(card: ServerCard): void {
		this.cardIndex.delete(card.id.split(':')[2])
	}
}
