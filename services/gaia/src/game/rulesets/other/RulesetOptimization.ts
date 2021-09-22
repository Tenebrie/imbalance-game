import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import UnitCorporealDespair from '@src/game/cards/01-arcane/epic/UnitCorporealDespair'
import LeaderNighterie from '@src/game/cards/01-arcane/leaders/Nighterie/LeaderNighterie'
import LeaderVelElleron from '@src/game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import TestingUnit100PowerVoidspawn from '@src/game/cards/11-testing/TestingUnit100PowerVoidspawn'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetOptimization extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: false,
			},
			hiddenFromMenu: true,
		})

		this.createBoard().player([
			[
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
				TestingUnit100PowerVoidspawn,
			],
			[TestingUnit100PowerVoidspawn, TestingUnit100PowerVoidspawn, TestingUnit100PowerVoidspawn],
			[],
		])

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderNighterie, { card: UnitCorporealDespair, count: 30 }],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.PASSIVE,
				deck: [LeaderVelElleron, { card: UnitChallengeDummyVanillaWarrior, count: 0 }],
			})
	}
}
