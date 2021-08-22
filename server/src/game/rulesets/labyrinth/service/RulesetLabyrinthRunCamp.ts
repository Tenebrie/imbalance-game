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
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import { getReward } from '@src/game/rulesets/labyrinth/service/LabyrinthRewards'
import { CardConstructor } from '@src/game/libraries/CardLibrary'

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

		/**
		 * Player count handling
		 */
		const [getPlayersExpected, setPlayersExpected] = this.useState(1)

		this.onLifecycle(RulesetLifecycleHook.PROGRESSION_LOADED, (game: ServerGame) => {
			setPlayersExpected(game, game.progression.labyrinth.state.run.playersExpected)
		})

		this.createSlots()
			.addGroup([
				{ type: 'player', deck: [LeaderLabyrinthPlayer] },
				{ type: 'player', deck: [LeaderLabyrinthPlayer], require: (game) => getPlayersExpected(game) > 1 },
			])
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.PASSIVE })
		// End of player count

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthNextEncounter)
			.perform(({ game }) => game.finish(game.getHumanGroup(), 'Continue to next encounter', true))

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const registeredPlayers = game.progression.labyrinth.state.run.players
			const newPlayers = game.allPlayers
				.filter((player) => player.isHuman)
				.filter((playerInGame) => !registeredPlayers.some((registeredPlayer) => registeredPlayer.id === playerInGame.player.id))
			newPlayers.forEach((newPlayer) => {
				game.progression.labyrinth.addPlayer(newPlayer.player)
			})
		})

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			game.owner!.playerInGame!.cardHand.addUnit(new SpellLabyrinthNextEncounter(game))

			const reward = getReward(game.progression.labyrinth.state)
			game.humanPlayers.forEach((playerInGame) => {
				reward.cardsInHand.forEach((card) => {
					addCardReward(game, playerInGame, card.card, card.count)
				})
			})
		})

		const addCardReward = (game: ServerGame, player: ServerPlayerInGame, card: CardConstructor, count: number): void => {
			for (let i = 0; i < count; i++) {
				Keywords.addCardToHand.for(player).fromConstructor(card)
			}
		}
	}
}
