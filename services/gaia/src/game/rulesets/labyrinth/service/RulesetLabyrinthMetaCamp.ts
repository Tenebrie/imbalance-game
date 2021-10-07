import AIBehaviour from '@shared/enums/AIBehaviour'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import RulesetFeature from '@shared/enums/RulesetFeature'
import SpellLabyrinthContinueRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthPreviousRun'
import SpellLabyrinthStartCoopRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartCoopRun'
import SpellLabyrinthStartRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartRun'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import Keywords from '@src/utils/Keywords'

export default class RulesetLabyrinthMetaCamp extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
			},
		})

		const getNextEncounter = (): RulesetConstructor | RulesetFeature[] => {
			const state = game.progression.labyrinth.state
			if (state.meta.runCount === 0) {
				return [RulesetFeature.LABYRINTH_ENCOUNTER]
			} else {
				return RulesetLabyrinthRunCamp
			}
		}

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setLinkGetter(getNextEncounter)

		this.createSlots()
			.addGroup({ type: 'player', deck: [LeaderLabyrinthPlayer, SpellLabyrinthStartRun, SpellLabyrinthStartCoopRun] })
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.PASSIVE })

		this.createCallback(GameEventType.GAME_SETUP).perform(() => {
			game.getHumanGroup().players.forEach((playerInGame) => {
				if (game.progression.labyrinth.state.run.encounterHistory.length > 0) {
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthContinueRun)
				}
				if (game.progression.labyrinth.state.lastRun) {
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthPreviousRun)
				}
			})
		})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthStartRun)
			.perform(async ({ game }) => {
				await startRun(game, false)
			})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthStartCoopRun)
			.perform(async ({ game }) => {
				await startRun(game, true)
			})

		const startRun = async (game: ServerGame, isCoop: boolean) => {
			await game.progression.labyrinth.resetRunState()
			if (isCoop) {
				game.progression.labyrinth.setExpectedPlayers(2)
			}

			game.systemFinish(game.getHumanGroup(), 'Starting new run', true)
			OutgoingMessageHandlers.executeMessageQueue(game)
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthContinueRun)
			.perform(({ game }) => {
				game.systemFinish(game.getHumanGroup(), 'Continuing existing run', true)
			})
	}
}
