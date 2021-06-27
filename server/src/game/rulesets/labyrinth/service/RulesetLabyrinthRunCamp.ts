import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import SpellLabyrinthNextEncounter from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthNextEncounter'
import RulesetLabyrinthDummies from '@src/game/rulesets/labyrinth/RulesetLabyrinthDummies'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import SpellLabyrinthContinueRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthPreviousRun'
import SpellLabyrinthRewardTreasureT1 from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardTreasureT1'
import SpellLabyrinthRewardCommonCard from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardCommonCard'
import SpellLabyrinthRewardTreasureT2 from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardTreasureT2'
import SpellLabyrinthRewardEpicCard from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardEpicCard'
import SpellLabyrinthRewardTreasureT3 from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardTreasureT3'
import SpellLabyrinthRewardLegendaryCard from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardLegendaryCard'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetLabyrinthRunCamp extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
			STARTING_PLAYER_MORALE: 1,
		})

		this.createChain().setFixedLink(RulesetLabyrinthDummies)
		this.createDeck().fixed([LeaderLabyrinthPlayer, SpellLabyrinthNextEncounter])
		this.createAI([LeaderLabyrinthOpponent]).behave(AIBehaviour.PASSIVE)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthNextEncounter)
			.perform(({ game }) => game.finish(game.getHumanPlayer(), 'Continue to next encounter', true))

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			if (game.progression.labyrinth.state.run.encounterHistory.length === 1) {
				addCardReward(game, 3)
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT1)
			} else if (game.progression.labyrinth.state.run.encounterHistory.length === 2) {
				addCardReward(game, 3)
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT1)
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT2)
			} else if (game.progression.labyrinth.state.run.encounterHistory.length === 3) {
				addCardReward(game, 3)
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT1)
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardTreasureT3)
			} else {
				addCardReward(game, 4)
			}
		})

		const addCardReward = (game: ServerGame, count: number): void => {
			for (let i = 0; i < count; i++) {
				const roll = Math.random()
				if (roll <= 0.5) {
					Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardCommonCard)
				} else if (roll <= 0.8) {
					Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardEpicCard)
				} else {
					Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthRewardLegendaryCard)
				}
			}
		}
	}
}
