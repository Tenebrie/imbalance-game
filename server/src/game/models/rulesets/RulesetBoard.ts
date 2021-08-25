import { CardConstructor } from '@src/game/libraries/CardLibrary'

export class RulesetBoard {
	public firstGroupBoardState: CardConstructor[][] = []
	public secondGroupBoardState: CardConstructor[][] = []
	public symmetricBoardState: CardConstructor[][] = []

	constructor(
		firstGroupBoardState: CardConstructor[][],
		secondGroupBoardState: CardConstructor[][],
		symmetricBoardState: CardConstructor[][]
	) {
		this.firstGroupBoardState = firstGroupBoardState
		this.secondGroupBoardState = secondGroupBoardState
		this.symmetricBoardState = symmetricBoardState
	}
}

export class RulesetBoardBuilder {
	private firstGroupBoardState: CardConstructor[][] = []
	private secondGroupBoardState: CardConstructor[][] = []
	private symmetricBoardState: CardConstructor[][] = []

	public player(state: CardConstructor[][]): RulesetBoardBuilder {
		this.firstGroupBoardState = state
		return this
	}

	public bot(state: CardConstructor[][]): RulesetBoardBuilder {
		this.secondGroupBoardState = state
		return this
	}

	public symmetric(state: CardConstructor[][]): RulesetBoardBuilder {
		this.symmetricBoardState = state
		return this
	}

	public __build(): RulesetBoard {
		return new RulesetBoard(this.firstGroupBoardState, this.secondGroupBoardState, this.symmetricBoardState)
	}
}
