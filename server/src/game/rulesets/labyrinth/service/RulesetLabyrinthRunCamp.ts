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
import ServerGame from '@src/game/models/ServerGame'
import SpellLabyrinthRewardCard from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardCard'
import {
	SpellLabyrinthRewardTreasureT1,
	SpellLabyrinthRewardTreasureT2,
	SpellLabyrinthRewardTreasureT3,
} from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardTreasure'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

export default class RulesetLabyrinthRunCamp extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			FIRST_GROUP_MOVES_FIRST: true,
			ROUND_WINS_REQUIRED: 1,
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setFixedLink(RulesetLabyrinthDummies)

		this.createSlots()
			.addGroup({ type: 'player', deck: [LeaderLabyrinthPlayer, SpellLabyrinthNextEncounter] })
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.PASSIVE })

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthNextEncounter)
			.perform(({ game }) => game.finish(game.getHumanGroup(), 'Continue to next encounter', true))

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			game.getHumanGroup().players.forEach((playerInGame) => {
				if (game.progression.labyrinth.state.run.encounterHistory.length === 0 && game.progression.labyrinth.state.meta.runCount === 0) {
					// No reward in the beginning
				} else if (
					game.progression.labyrinth.state.run.encounterHistory.length === 0 &&
					game.progression.labyrinth.state.meta.runCount > 0
				) {
					addCardReward(game, playerInGame, 1)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT1)
				} else if (game.progression.labyrinth.state.run.encounterHistory.length === 1) {
					addCardReward(game, playerInGame, 3)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT1)
				} else if (game.progression.labyrinth.state.run.encounterHistory.length === 2) {
					addCardReward(game, playerInGame, 3)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT1)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT2)
				} else if (game.progression.labyrinth.state.run.encounterHistory.length === 3) {
					addCardReward(game, playerInGame, 3)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT1)
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthRewardTreasureT3)
				} else {
					addCardReward(game, playerInGame, 4)
				}
			})
		})

		const addCardReward = (game: ServerGame, player: ServerPlayerInGame, count: number): void => {
			for (let i = 0; i < count; i++) {
				Keywords.addCardToHand.for(player).fromConstructor(SpellLabyrinthRewardCard)
			}
		}
	}
}
