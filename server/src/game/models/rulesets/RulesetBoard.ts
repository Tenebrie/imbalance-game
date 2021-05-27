import { CardConstructor } from '@src/game/libraries/CardLibrary'

export class RulesetBoard {
	public playerBoardState: CardConstructor[][] = []
	public opponentBoardState: CardConstructor[][] = []
	public symmetricBoardState: CardConstructor[][] = []

	constructor(playerBoardState: CardConstructor[][], opponentBoardState: CardConstructor[][], symmetricBoardState: CardConstructor[][]) {
		this.playerBoardState = playerBoardState
		this.opponentBoardState = opponentBoardState
		this.symmetricBoardState = symmetricBoardState
	}
}

export class RulesetBoardBuilder {
	private playerBoardState: CardConstructor[][] = []
	private opponentBoardState: CardConstructor[][] = []
	private symmetricBoardState: CardConstructor[][] = []

	public player(state: CardConstructor[][]): RulesetBoardBuilder {
		this.playerBoardState = state
		return this
	}

	public opponent(state: CardConstructor[][]): RulesetBoardBuilder {
		this.opponentBoardState = state
		return this
	}

	public symmetric(state: CardConstructor[][]): RulesetBoardBuilder {
		this.symmetricBoardState = state
		return this
	}

	public __build(): RulesetBoard {
		return new RulesetBoard(this.playerBoardState, this.opponentBoardState, this.symmetricBoardState)
	}
}
