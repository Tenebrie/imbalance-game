import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TestingLeader from '@src/game/cards/11-testing/TestingLeader'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import TestingRulesetPVP from '@src/game/rulesets/testing/TestingRulesetPVP'

export default class TestingRulesetChain extends ServerRuleset {
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
					type: 'ai',
					behaviour: AIBehaviour.DEFAULT,
					deck: [TestingLeader],
				},
			])

		this.createChain().setFixedLink(TestingRulesetPVP)
	}
}
