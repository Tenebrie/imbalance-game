import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import UnitMerfolkSkygazer from '@src/game/cards/00-human/epic/UnitMerfolkSkygazer'
import LeaderNighterie from '@src/game/cards/01-arcane/leaders/Nighterie/LeaderNighterie'
import LeaderVelElleron from '@src/game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import HeroFelineSaint from '@src/game/cards/02-wild/legendary/HeroFelineSaint'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetCatastrophe extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: false,
			},
		})

		this.createBoard().bot([
			[UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer],
			[UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer],
			[UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer, UnitMerfolkSkygazer],
		])

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderNighterie, { card: HeroFelineSaint, count: 30 }],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.PASSIVE,
				deck: [LeaderVelElleron, { card: UnitChallengeDummyVanillaWarrior, count: 0 }],
			})
	}
}
