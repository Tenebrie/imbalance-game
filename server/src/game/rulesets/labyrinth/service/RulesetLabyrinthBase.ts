import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import RulesetLabyrinthMetaCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthMetaCamp'

export default class RulesetLabyrinthBase extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
		})

		this.updateConstants({
			PLAYER_MOVES_FIRST: true,
			UNIT_HAND_SIZE_STARTING: 0,
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanPlayer())
			.setFixedLink(RulesetLabyrinthRunCamp)

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanPlayer())
			.setFixedLink(RulesetLabyrinthMetaCamp)

		this.createDeck().fixed([LeaderLabyrinthPlayer])

		this.createAI([LeaderLabyrinthOpponent])

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
			const player = game.getHumanPlayer()
			state.cards.forEach((card) => {
				for (let i = 0; i < card.count; i++) {
					player.cardDeck.addUnitToBottom(CardLibrary.instantiateFromClass(game, card.class))
				}
			})
			state.items.forEach((card) => {
				player.cardHand.addSpell(CardLibrary.instantiateFromClass(game, card.cardClass))
			})
		})

		this.createCallback(GameEventType.GAME_FINISHED).perform(({ game, victoriousPlayer }) => {
			game.progression.labyrinth.addEncounterToHistory(this.class)
			if (victoriousPlayer !== game.getHumanPlayer()) {
				game.progression.labyrinth.failRun()
			}
		})
	}
}
