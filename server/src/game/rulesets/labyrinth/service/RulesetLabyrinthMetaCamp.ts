import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import SpellLabyrinthStartRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartRun'
import RulesetLabyrinthDummies from '@src/game/rulesets/labyrinth/RulesetLabyrinthDummies'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import SpellLabyrinthContinueRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthPreviousRun'
import ServerGame from '@src/game/models/ServerGame'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import SpellLabyrinthStartCoopRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartCoopRun'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'

export default class RulesetLabyrinthMetaCamp extends ServerRuleset {
	nextEncounter: RulesetConstructor | null = null

	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
			},
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setLinkGetter(() => this.nextEncounter!)

		this.createSlots()
			.addGroup({ type: 'player', deck: [LeaderLabyrinthPlayer, SpellLabyrinthStartRun, SpellLabyrinthStartCoopRun] })
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.PASSIVE })

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
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

			if (game.progression.labyrinth.state.meta.runCount === 0) {
				this.nextEncounter = RulesetLabyrinthDummies
			} else {
				this.nextEncounter = RulesetLabyrinthRunCamp
			}
			game.finish(game.getHumanGroup(), 'Starting new run', true)
			OutgoingMessageHandlers.executeMessageQueue(game)
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthContinueRun)
			.perform(({ game }) => {
				this.nextEncounter = RulesetLabyrinthRunCamp
				game.finish(game.getHumanGroup(), 'Continuing existing run', true)
			})
	}
}
