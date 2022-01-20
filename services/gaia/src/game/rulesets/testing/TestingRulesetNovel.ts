import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TestingLeader from '@src/game/cards/11-testing/TestingLeader'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class TestingRulesetNovel extends ServerRuleset {
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

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ group }) => group.index === 0)
			.startDialog(
				`
				> This is a script.
			`
			)
	}
}
