import AIBehaviour from '@shared/enums/AIBehaviour'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import RulesetFeature from '@shared/enums/RulesetFeature'
import LeaderRitesOpponent from '@src/game/cards/12-rites/LeaderRitesOpponent'
import LeaderRitesPlayer from '@src/game/cards/12-rites/LeaderRitesPlayer'
import LeaderRitesPlayerUnit from '@src/game/cards/12-rites/LeaderRitesPlayerUnit'
import CardLibrary from '@src/game/libraries/CardLibrary'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import { ServerRuleset, ServerRulesetProps } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import RulesetRitesMetaCamp from '@src/game/rulesets/rites/service/RulesetRitesMetaCamp'
import RulesetRitesRunCamp from '@src/game/rulesets/rites/service/RulesetRitesRunCamp'
import Keywords from '@src/utils/Keywords'

export default abstract class BaseRulesetRitesEncounter extends ServerRuleset {
	playersExpected = 1

	protected constructor(game: ServerGame, props?: Partial<ServerRulesetProps>) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.RITES,
			features: [RulesetFeature.LABYRINTH_ENCOUNTER].concat(props?.features || []),
			sortPriority: props?.sortPriority || 0,
			constants: {
				FIRST_GROUP_MOVES_FIRST: true,
				UNIT_HAND_SIZE_STARTING: 7,
				...props?.constants,
			},
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setFixedLink(RulesetRitesRunCamp)

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanGroup())
			.setFixedLink(RulesetRitesMetaCamp)

		this.onLifecycle(RulesetLifecycleHook.PROGRESSION_LOADED, (game: ServerGame) => {
			this.playersExpected = game.progression.rites.state.run.playersExpected
		})

		this.createSlots()
			.addGroup([
				{ type: 'player', deck: [LeaderRitesPlayer] },
				{ type: 'player', deck: [LeaderRitesPlayer], require: () => this.playersExpected > 1 },
			])
			.addGroup({ type: 'ai', deck: [LeaderRitesOpponent], behaviour: AIBehaviour.DEFAULT })

		// Initialize coop player count
		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const registeredPlayers = game.progression.rites.state.run.players
			const newPlayers = game.allPlayers
				.filter((player) => player.isHuman)
				.filter((playerInGame) => !registeredPlayers.some((registeredPlayer) => registeredPlayer.id === playerInGame.player.id))
			newPlayers.forEach((newPlayer) => {
				game.progression.rites.addPlayer(newPlayer.player)
			})
		})

		// Load cards
		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const state = game.progression.rites.state.run
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

		// Spawn leader unit
		this.createCallback(GameEventType.GAME_SETUP).perform(() => {
			const group = game.getHumanGroup()
			const targetRow = game.board.getRowWithDistanceToFront(group, 1)
			group.players.forEach((player) => {
				Keywords.summonUnit({
					owner: player,
					cardConstructor: LeaderRitesPlayerUnit,
					rowIndex: targetRow.index,
					unitIndex: 11,
				})
			})
		})

		this.createCallback(GameEventType.GAME_FINISHED).perform((args) => {
			const { game, victoriousPlayer } = args
			if (victoriousPlayer === game.getHumanGroup()) {
				game.progression.rites.addEncounterToHistory(this.class)
				game.progression.rites.popEncounterFromDeck()
			} else {
				game.progression.rites.failRun()
			}
		})
	}
}
