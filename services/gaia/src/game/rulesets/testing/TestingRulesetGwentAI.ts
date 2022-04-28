import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TestingLeader from '@src/game/cards/11-testing/TestingLeader'
import GameHookType, { GameFinishedHookEditableValues } from '@src/game/models/events/GameHookType'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class TestingRulesetGwentAI extends ServerRuleset {
	private gameFinishedHookParams: Partial<GameFinishedHookEditableValues> = {}

	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				PASSIVE_LEADERS: true,
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
					type: 'ai',
					behaviour: AIBehaviour.DEFAULT,
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
