import AIBehaviour from '@shared/enums/AIBehaviour'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import SpellLabyrinthNextEncounter from '@src/game/cards/12-rites/actions/SpellLabyrinthNextEncounter'
import LeaderRitesOpponent from '@src/game/cards/12-rites/LeaderRitesOpponent'
import LeaderRitesPlayer from '@src/game/cards/12-rites/LeaderRitesPlayer'
import CardLibrary, { CardConstructor } from '@src/game/libraries/CardLibrary'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import { getReward } from '@src/game/rulesets/rites/service/RitesRewards'

export default class RulesetRitesRunCamp extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.COOP,
			category: RulesetCategory.RITES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setLinkGetter(() => {
				const nextEncounter = game.progression.rites.state.run.encounterDeck[0]
				if (!nextEncounter) {
					throw new Error('No encounters left in the encounter deck!')
				}

				const nextRuleset = RulesetLibrary.findTemplateByClass(nextEncounter.class)
				if (!nextRuleset) {
					throw new Error(`Unable to find ruleset with class ${nextEncounter.class}!`)
				}
				return nextRuleset
			})

		const [getPlayersExpected, setPlayersExpected] = this.useState(1)

		this.onLifecycle(RulesetLifecycleHook.PROGRESSION_LOADED, () => {
			setPlayersExpected(game.progression.rites.state.run.playersExpected)
		})

		this.createSlots()
			.addGroup([
				{ type: 'player', deck: [LeaderRitesPlayer] },
				{ type: 'player', deck: [LeaderRitesPlayer], require: () => getPlayersExpected() > 1 },
			])
			.addGroup({ type: 'ai', deck: [LeaderRitesOpponent], behaviour: AIBehaviour.PASSIVE })

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthNextEncounter)
			.perform(({ game }) => game.systemFinish(game.getHumanGroup(), GameVictoryCondition.SYSTEM_GAME, true))

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const registeredPlayers = game.progression.rites.state.run.players
			const newPlayers = game.allPlayers
				.filter((player) => player.isHuman)
				.filter((playerInGame) => !registeredPlayers.some((registeredPlayer) => registeredPlayer.id === playerInGame.player.id))
			newPlayers.forEach((newPlayer) => {
				game.progression.rites.addPlayer(newPlayer.player)
			})
		})

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const state = game.progression.rites.state.run
			game.humanPlayers.forEach((playerInGame) => {
				const playerState = state.playerStates[playerInGame.player.id]
				if (!playerState) {
					throw new Error(`Player ${playerInGame.player.username} has no state available!`)
				}
				playerState.items.forEach((card) => {
					playerInGame.cardHand.addSpell(CardLibrary.instantiateFromClass(game, card.cardClass))
				})
			})
		})

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			game.owner!.playerInGame!.cardHand.addUnit(new SpellLabyrinthNextEncounter(game))

			const reward = getReward(game.progression.rites.state)
			game.humanPlayers.forEach((playerInGame) => {
				reward.cardsInHand.forEach((card) => {
					addCardReward(game, playerInGame, card.card, card.count)
				})
			})
		})

		const addCardReward = (game: ServerGame, player: ServerPlayerInGame, card: CardConstructor, count: number): void => {
			for (let i = 0; i < count; i++) {
				player.cardHand.addUnit(CardLibrary.instantiate(game, card))
			}
		}
	}
}
