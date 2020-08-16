import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import ServerUnit from '../models/ServerUnit'
import ServerBoardRow from '../models/ServerBoardRow'

export default class BotCardEvaluation {
	game: ServerGame
	card: ServerCard

	constructor(card: ServerCard) {
		this.game = card.game
		this.card = card
	}

	public get expectedValue(): number {
		return this.card.power
	}

	public get baseThreat(): number {
		return 2
	}

	public get threatMultiplier(): number {
		return 0.75
	}

	public evaluateTargetCard(target: ServerCard): number {
		return 0
	}

	public evaluateTargetUnit(target: ServerUnit): number {
		return 0
	}

	public evaluateTargetRow(target: ServerBoardRow): number {
		return 0
	}
}
