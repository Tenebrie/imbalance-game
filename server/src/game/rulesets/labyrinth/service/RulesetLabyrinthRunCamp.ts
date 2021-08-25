import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import SpellLabyrinthNextEncounter from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthNextEncounter'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import { getReward } from '@src/game/rulesets/labyrinth/service/LabyrinthRewards'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import RulesetFeature from '@shared/enums/RulesetFeature'

export default class RulesetLabyrinthRunCamp extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setFeatureLink(RulesetFeature.LABYRINTH_ENCOUNTER)

		const [getPlayersExpected, setPlayersExpected] = this.useState(1)

		this.onLifecycle(RulesetLifecycleHook.PROGRESSION_LOADED, () => {
			setPlayersExpected(game.progression.labyrinth.state.run.playersExpected)
		})

		this.createSlots()
			.addGroup([
				{ type: 'player', deck: [LeaderLabyrinthPlayer] },
				{ type: 'player', deck: [LeaderLabyrinthPlayer], require: () => getPlayersExpected() > 1 },
			])
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.PASSIVE })

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
