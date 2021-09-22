import GameEventType from '@shared/enums/GameEventType'
import { LabyrinthProgressionRunState } from '@shared/models/progression/LabyrinthProgressionState'
import UnitLabyrinthLostHound from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostHound'
import UnitLabyrinthLostShieldbearer from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostShieldbearer'
import HeroLabyrinthGatekeeper from '@src/game/cards/12-labyrinth/enemies/HeroLabyrinthGatekeeper'
import ServerGame from '@src/game/models/ServerGame'
import BaseRulesetLabyrinthEncounter from '@src/game/rulesets/labyrinth/service/BaseRulesetLabyrinthEncounter'

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

		this.createCallback(GameEventType.GAME_FINISHED).perform(({ victoriousPlayer }) => {
			let outcome: 'win' | 'lose' | 'kill' = 'lose'
			if (!game.board.getAllUnits().find((unit) => unit.card instanceof HeroLabyrinthGatekeeper)) {
				outcome = 'kill'
			} else if (victoriousPlayer === game.getHumanGroup()) {
				outcome = 'win'
			}
			const previousFights = game.progression.labyrinth.state.meta.gatekeeperEncounters

			/* TODO: Everything */
			if (outcome === 'win' && previousFights === 0)
				game.novel.startDialog(
					() => `
						Gatekeeper:
						> You may pass into the Labyrinth.
						> This journey 
						> Whether you fall in battle or reach the end...
						> We will meet again.
					`
				)

			if (outcome === 'win' && previousFights === 1)
				game.novel.startDialog(
					() => `
						Gatekeeper:
						> This is your second attempt to reach the end of the Labyrinth, is it not?
						> 
					`
				)

			if (outcome === 'win' && previousFights === 2)
				game.novel.startDialog(
					() => `
						Gatekeeper:
						> I am glad to see you strong again.
						> And I hope you find what you are looking for.
					`
				)

			if (outcome === 'lose' && previousFights === 1)
				game.novel.startDialog(
					() => `
						Gatekeeper:
						> 
					`
				)

			if (outcome === 'lose' && previousFights === 2)
				game.novel.startDialog(
					() => `
						Gatekeeper:
						> I am glad to see you strong again.
						> And I hope you find what you are looking for.
					`
				)

			game.progression.labyrinth.addGatekeeperEvent(outcome)
		})
	}

	isValidEncounter(state: LabyrinthProgressionRunState): boolean {
		return state.encounterHistory.length === 0
	}
}
