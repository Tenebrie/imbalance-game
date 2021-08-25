import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderNighterie from '@src/game/cards/01-arcane/leaders/Nighterie/LeaderNighterie'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import HeroLightOracle from '@src/game/cards/09-neutral/epic/HeroLightOracle'

export default class RulesetDev extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
			constants: {
				ROUND_WINS_REQUIRED: 1,
				FIRST_GROUP_MOVES_FIRST: true,
				GAME_BOARD_ROW_COUNT: 6,
				SKIP_MULLIGAN: true,
			},
		})

		this.createSlots()
			.addGroup([
				{
					type: 'player',
					deck: [LeaderNighterie, { card: HeroLightOracle, count: 30 }],
				},
			])
			.addGroup([
				{
					type: 'ai',
					behaviour: AIBehaviour.PASSIVE,
					deck: [LeaderChallengeDummy, { card: UnitStrayDog, count: 30 }],
				},
			])
	}
}
