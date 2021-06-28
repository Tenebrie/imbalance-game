import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import AIBehaviour from '@shared/enums/AIBehaviour'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import SpellLabyrinthStartRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthStartRun'
import RulesetLabyrinthDummies from '@src/game/rulesets/labyrinth/RulesetLabyrinthDummies'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import SpellLabyrinthContinueRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthContinueRun'
import SpellLabyrinthPreviousRun from '@src/game/cards/12-labyrinth/actions/SpellLabyrinthPreviousRun'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerGame from '@src/game/models/ServerGame'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import OutgoingMessageHandlers from '@src/game/handlers/OutgoingMessageHandlers'

type State = {
	nextEncounter: RulesetConstructor | null
}

export default class RulesetLabyrinthMetaCamp extends ServerRulesetBuilder<State> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
			state: {
				nextEncounter: null,
			},
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
		})

		const getNextRuleset = (game: ServerGame): RulesetConstructor => {
			return this.getState(game).nextEncounter!
		}
		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanPlayer())
			.setLinkGetter(getNextRuleset)

		this.createDeck().fixed([LeaderLabyrinthPlayer, SpellLabyrinthStartRun])
		this.createAI([LeaderLabyrinthOpponent]).behave(AIBehaviour.PASSIVE)

		this.createCallback(GameEventType.GAME_SETUP).perform(({ game }) => {
			if (game.progression.labyrinth.state.run.encounterHistory.length > 0) {
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthContinueRun)
			}
			if (game.progression.labyrinth.state.lastRun) {
				Keywords.addCardToHand.for(game.getHumanPlayer()).fromConstructor(SpellLabyrinthPreviousRun)
			}
		})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthStartRun)
			.perform(async ({ game }) => {
				await game.progression.labyrinth.resetRunState()
				if (game.progression.labyrinth.state.meta.runCount === 0) {
					this.getState(game).nextEncounter = RulesetLabyrinthDummies
				} else {
					this.getState(game).nextEncounter = RulesetLabyrinthRunCamp
				}
				game.finish(game.getHumanPlayer(), 'Starting new run', true)
				OutgoingMessageHandlers.executeMessageQueue(game)
			})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellLabyrinthContinueRun)
			.perform(({ game }) => {
				this.getState(game).nextEncounter = RulesetLabyrinthRunCamp
				game.finish(game.getHumanPlayer(), 'Continuing existing run', true)
			})
	}
}
