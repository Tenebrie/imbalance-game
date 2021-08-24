import BaseRulesetLabyrinthEncounter from '@src/game/rulesets/labyrinth/service/BaseRulesetLabyrinthEncounter'
import GameEventType from '@shared/enums/GameEventType'
import ServerGame from '@src/game/models/ServerGame'
import HeroLabyrinthGatekeeper from '@src/game/cards/12-labyrinth/enemies/HeroLabyrinthGatekeeper'
import UnitLabyrinthLostHound from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostHound'
import UnitLabyrinthLostShieldbearer from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostShieldbearer'
import { LabyrinthProgressionRunState } from '@shared/models/progression/LabyrinthProgressionState'

export default class RulesetLabyrinthGatekeeper extends BaseRulesetLabyrinthEncounter {
	constructor(game: ServerGame) {
		super(game, {
			constants: {
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createBoard().bot([
			[UnitLabyrinthLostHound, UnitLabyrinthLostHound, UnitLabyrinthLostHound, UnitLabyrinthLostHound, UnitLabyrinthLostHound],
			[UnitLabyrinthLostShieldbearer, UnitLabyrinthLostShieldbearer],
			[HeroLabyrinthGatekeeper],
		])

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
		})

		this.createCallback(GameEventType.GAME_FINISHED)
	}

	isValidEncounter(state: LabyrinthProgressionRunState): boolean {
		console.log(state.encounterHistory.length)
		return state.encounterHistory.length === 0
	}
}
