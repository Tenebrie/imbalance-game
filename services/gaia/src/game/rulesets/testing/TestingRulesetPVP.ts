import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TestingLeader from '@src/game/cards/11-testing/TestingLeader'
import GameHookType, { GameFinishedHookEditableValues } from '@src/game/models/events/GameHookType'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class TestingRulesetPVP extends ServerRuleset {
	private gameFinishedHookParams: Partial<GameFinishedHookEditableValues> = {}

	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVP,
			category: RulesetCategory.PVP,
			constants: {
				SKIP_MULLIGAN: true,
			},
		})

		this.createSlots()
			.addGroup([
				{
					type: 'player',
					deck: [TestingLeader],
				},
			])
			.addGroup([
				{
					type: 'player',
					deck: [TestingLeader],
				},
			])

		this.createHook(GameHookType.GAME_FINISHED).replace((args) => ({
			...args,
			...this.gameFinishedHookParams,
		}))
	}

	public setGameFinishedHookParams(params: Partial<GameFinishedHookEditableValues>): void {
		this.gameFinishedHookParams = params
	}
}
