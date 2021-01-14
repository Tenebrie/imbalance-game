import Core from '@/Pixi/Core'
import Unit from '@shared/models/Unit'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class RenderedUnit implements Unit {
	public card: RenderedCard
	public owner: ClientPlayerInGame
	public isFadingOut = false

	public constructor(card: RenderedCard, owner: ClientPlayerInGame) {
		this.card = card
		this.owner = owner
	}

	public get rowIndex(): number {
		return Core.board.rows.indexOf(Core.board.getRowWithCard(this)!)
	}

	public get unitIndex(): number {
		return Core.board.rows[this.rowIndex].cards.indexOf(this)
	}

	public fadeOut(): void {
		setTimeout(() => {
			this.isFadingOut = true
		}, 100)
	}
}
