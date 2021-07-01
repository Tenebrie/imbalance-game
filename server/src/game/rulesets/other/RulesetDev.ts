import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import AIBehaviour from '@shared/enums/AIBehaviour'
import UnitYogaTeacher from '@src/game/cards/09-neutral/common/UnitYogaTeacher'
import LeaderNighterie from '@src/game/cards/01-arcane/leaders/Nighterie/LeaderNighterie'
import UnitDryadWolfspeaker from '@src/game/cards/02-wild/common/UnitDryadWolfspeaker'

export default class RulesetDev extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
		})

		this.createSlots()
			.addGroup([
				{
					type: 'player',
					deck: [LeaderNighterie, { card: UnitDryadWolfspeaker, count: 30 }],
				},
				{
					type: 'player',
					deck: [LeaderMaximilian, { card: UnitYogaTeacher, count: 30 }],
				},
			])
			.addGroup([
				{
					type: 'ai',
					behaviour: AIBehaviour.PASSIVE,
					deck: [LeaderChallengeDummy, { card: UnitStrayDog, count: 30 }],
				},
			])

		this.updateConstants({
			ROUND_WINS_REQUIRED: 1,
			FIRST_GROUP_MOVES_FIRST: true,
			GAME_BOARD_ROW_COUNT: 6,
		})
	}
}
