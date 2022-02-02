import AIBehaviour from '@shared/enums/AIBehaviour'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import RulesetFeature from '@shared/enums/RulesetFeature'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import SpellLabyrinthContinueRun from '@src/game/cards/12-rites/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-rites/actions/SpellLabyrinthPreviousRun'
import SpellLabyrinthStartCoopRun from '@src/game/cards/12-rites/actions/SpellLabyrinthStartCoopRun'
import SpellLabyrinthStartRun from '@src/game/cards/12-rites/actions/SpellLabyrinthStartRun'
import LeaderRitesOpponent from '@src/game/cards/12-rites/LeaderRitesOpponent'
import LeaderRitesPlayer from '@src/game/cards/12-rites/LeaderRitesPlayer'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import RulesetRitesRunCamp from '@src/game/rulesets/rites/service/RulesetRitesRunCamp'
import Keywords from '@src/utils/Keywords'

export default class RulesetRitesMetaCamp extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.COOP,
			category: RulesetCategory.RITES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
			},
		})

		const getNextEncounter = (): RulesetConstructor | RulesetFeature[] => {
			const state = game.progression.rites.state
			if (state.meta.runCount === 0) {
				return [RulesetFeature.LABYRINTH_ENCOUNTER]
			} else {
				return RulesetRitesRunCamp
			}
		}

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setLinkGetter(getNextEncounter)

		this.createSlots()
			.addGroup({ type: 'player', deck: [LeaderRitesPlayer, SpellLabyrinthStartRun, SpellLabyrinthStartCoopRun] })
			.addGroup({ type: 'ai', deck: [LeaderRitesOpponent], behaviour: AIBehaviour.PASSIVE })

		this.createCallback(GameEventType.GAME_SETUP).perform(() => {
			game.getHumanGroup().players.forEach((playerInGame) => {
				if (game.progression.rites.state.run.encounterHistory.length > 0) {
					Keywords.addCardToHand.for(playerInGame).fromConstructor(SpellLabyrinthContinueRun)
				}
				if (game.progression.rites.state.lastRun) {
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
			await game.progression.rites.resetRunState()
			if (isCoop) {
				game.progression.rites.setExpectedPlayers(2)
			}

			game.systemFinish(game.getHumanGroup(), GameVictoryCondition.SYSTEM_GAME, true)
			OutgoingMessageHandlers.executeMessageQueue(game)
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthContinueRun)
			.perform(({ game }) => {
				game.systemFinish(game.getHumanGroup(), GameVictoryCondition.SYSTEM_GAME, true)
			})
	}
}
