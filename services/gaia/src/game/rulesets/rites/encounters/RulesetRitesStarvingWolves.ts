import GameEventType from '@shared/enums/GameEventType'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitRitesStarvingWolf from '@src/game/cards/12-rites/enemies/UnitRitesStarvingWolf'
import UnitRitesWolfpackAlpha from '@src/game/cards/12-rites/enemies/UnitRitesWolfpackAlpha'
import ServerGame from '@src/game/models/ServerGame'
import BaseRulesetRitesEncounter from '@src/game/rulesets/rites/service/BaseRulesetRitesEncounter'
import Keywords from '@src/utils/Keywords'

export default class RulesetRitesStarvingWolves extends BaseRulesetRitesEncounter {
	constructor(game: ServerGame) {
		super(game, {
			constants: {
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createBoard().bot([
			[UnitRitesStarvingWolf, UnitRitesStarvingWolf],
			[UnitRitesWolfpackAlpha],
			[UnitRitesStarvingWolf, UnitRitesStarvingWolf],
		])

		this.createObjective({
			en: {
				title: 'Overpower',
				description: 'Obtain a higher board Power than the opponent.',
			},
		})

		this.createCallback(GameEventType.GAME_SETUP)
			.perform(({ game }) => {
				const state = game.progression.rites.state.run
				const difficulty = state.encounterHistory.length
				const bot = game.getBotPlayer()
				const botRows = game.board.getControlledRows(bot)
				Keywords.summonMultipleUnits({
					owner: bot,
					cardConstructor: UnitRitesStarvingWolf,
					rowIndex: botRows[0].index,
					unitIndex: 2,
					count: difficulty,
				})
			})
			.startDialog(() => {
				const character = game.progression.rites.state.meta.character

				return `
					> A bunch of wolves jump you in the forest!
					@ [Start combat]
				`
			})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.isHuman)
			.require(({ group }) => game.board.getTotalPlayerPower(group) > game.board.getTotalPlayerPower(group.opponent))
			.startDialog(
				() => `
				> The wolves scatter as you show them your might.
					> You may now continue your path unimpeded.
				--> Finish
			`
			)
			.actionChapter('Finish', () => game.systemFinish(game.getHumanGroup(), GameVictoryCondition.STORY_TRIGGER))
	}
}
