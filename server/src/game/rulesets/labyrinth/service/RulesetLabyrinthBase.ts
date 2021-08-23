import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import RulesetLabyrinthMetaCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthMetaCamp'
import AIBehaviour from '@shared/enums/AIBehaviour'
import RulesetLifecycleHook from '@src/game/models/rulesets/RulesetLifecycleHook'
import ServerGame from '@src/game/models/ServerGame'
import GameHookType from '@src/game/models/events/GameHookType'
import { ServerRuleset, ServerRulesetProps } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetLabyrinthBase extends ServerRuleset {
	playersExpected = 1

	constructor(game: ServerGame, props?: Partial<ServerRulesetProps>) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			constants: {
				FIRST_GROUP_MOVES_FIRST: true,
				UNIT_HAND_SIZE_STARTING: 0,
				...props?.constants,
			},
			...(props ? props : {}),
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
				console.log(playerState.cards)
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

		const [getSavingState, setSavingState] = this.useState<'not_saved' | 'saving' | 'saved'>('not_saved')

		this.createHook(GameHookType.GAME_FINISHED).replace((editableValues, fixedValues) => {
			const { game, victoriousPlayer, victoryReason, chainImmediately } = fixedValues
			const savingState = getSavingState()
			if (savingState === 'saving' || savingState === 'saved') {
				return {
					...editableValues,
					finishPrevented: savingState === 'saving',
				}
			}

			setSavingState('saving')

			const onSave = () => {
				setSavingState('saved')
				game.finish(victoriousPlayer, victoryReason, chainImmediately)
			}
			if (victoriousPlayer === game.getHumanGroup()) {
				game.progression.labyrinth.addEncounterToHistory(this.class).then(onSave)
			} else {
				game.progression.labyrinth.failRun().then(onSave)
			}
			return {
				...editableValues,
				finishPrevented: true,
			}
		})
	}
}
