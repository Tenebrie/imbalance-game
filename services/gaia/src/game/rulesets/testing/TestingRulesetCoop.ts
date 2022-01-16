import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TestingLeader from '@src/game/cards/11-testing/TestingLeader'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class TestingRulesetCoop extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
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
				{
					type: 'player',
					deck: [TestingLeader],
				},
			])
			.addGroup([
				{
					type: 'ai',
					deck: [TestingLeader],
					behaviour: AIBehaviour.DEFAULT,
				},
			])
	}
}
