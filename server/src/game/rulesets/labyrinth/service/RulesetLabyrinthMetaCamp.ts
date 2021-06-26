import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import SpellLabyrinthStartRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartRun'
import RulesetLabyrinthDummies from '@src/game/rulesets/labyrinth/RulesetLabyrinthDummies'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import SpellLabyrinthContinueRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthPreviousRun'
import SpellLabyrinthRewardTreasureT1 from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthRewardTreasureT1'

export default class RulesetLabyrinthMetaCamp extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
		})

		this.createChain().setFixedLink(RulesetLabyrinthDummies)

		this.createDeck().fixed([LeaderLabyrinthPlayer, SpellLabyrinthStartRun])
		this.createAI([LeaderLabyrinthOpponent]).behave(AIBehaviour.PASSIVE)

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			if (game.progression.labyrinth.state.run.encounterHistory.length > 0) {
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthContinueRun)
			}
			if (game.progression.labyrinth.state.lastRun) {
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthPreviousRun)
			}
			if (game.progression.labyrinth.state.meta.runCount > 0) {
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT1)
			}
		})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthStartRun)
			.perform(({ game }) => {
				game.progression.labyrinth.resetRunState().then(() => {
					game.finish(game.getHumanPlayer(), 'Starting new run', true)
				})
			})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthContinueRun)
			.perform(async ({ game }) => {
				game.finish(game.getHumanPlayer(), 'Continuing existing run', true)
			})
	}
}
