import AIBehaviour from '@shared/enums/AIBehaviour'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import RulesetFeature from '@shared/enums/RulesetFeature'
import { LabyrinthProgressionMetaState, LabyrinthProgressionRunState } from '@shared/models/progression/LabyrinthProgressionState'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import CardLibrary from '@src/game/libraries/CardLibrary'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import { ServerRuleset, ServerRulesetProps } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import RulesetLabyrinthMetaCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthMetaCamp'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'

export default abstract class BaseRulesetLabyrinthEncounter extends ServerRuleset {
	playersExpected = 1

	protected constructor(game: ServerGame, props?: Partial<ServerRulesetProps>) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			features: [RulesetFeature.LABYRINTH_ENCOUNTER].concat(props?.features || []),
			sortPriority: props?.sortPriority || 0,
			constants: {
				FIRST_GROUP_MOVES_FIRST: true,
				UNIT_HAND_SIZE_STARTING: 0,
				...props?.constants,
			},
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setFixedLink(RulesetLabyrinthRunCamp)

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanGroup())
			.setFixedLink(RulesetLabyrinthMetaCamp)

		this.onLifecycle(RulesetLifecycleHook.PROGRESSION_LOADED, (game: ServerGame) => {
			this.playersExpected = game.progression.labyrinth.state.run.playersExpected
		})

		this.createSlots()
			.addGroup([
				{ type: 'player', deck: [LeaderLabyrinthPlayer] },
				{ type: 'player', deck: [LeaderLabyrinthPlayer], require: () => this.playersExpected > 1 },
			])
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.DEFAULT })

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const registeredPlayers = game.progression.labyrinth.state.run.players
			const newPlayers = game.allPlayers
				.filter((player) => player.isHuman)
				.filter((playerInGame) => !registeredPlayers.some((registeredPlayer) => registeredPlayer.id === playerInGame.player.id))
			newPlayers.forEach((newPlayer) => {
				game.progression.labyrinth.addPlayer(newPlayer.player)
			})
		})

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
			game.humanPlayers.forEach((playerInGame) => {
				const playerState = state.playerStates[playerInGame.player.id]
				if (!playerState) {
					throw new Error(`Player ${playerInGame.player.username} has no state available!`)
				}
				playerState.cards.forEach((card) => {
					for (let i = 0; i < card.count; i++) {
						playerInGame.cardDeck.addUnitToBottom(CardLibrary.instantiateFromClass(game, card.class))
					}
				})
				playerState.items.forEach((card) => {
					playerInGame.cardHand.addSpell(CardLibrary.instantiateFromClass(game, card.cardClass))
				})
			})
		})

		this.createCallback(GameEventType.GAME_FINISHED).perform((args) => {
			const { game, victoriousPlayer } = args
			if (victoriousPlayer === game.getHumanGroup()) {
				game.progression.labyrinth.addEncounterToHistory(this.class)
			} else {
				game.progression.labyrinth.failRun()
			}
		})
	}

	public isValidChainFrom(game: ServerGame): boolean {
		const state = game.progression.labyrinth.state.run
		const meta = game.progression.labyrinth.state.meta
		return this.isValidEncounter(state, meta)
	}

	public abstract isValidEncounter(state: LabyrinthProgressionRunState, meta: LabyrinthProgressionMetaState): boolean
}
