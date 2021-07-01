import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import LeaderLabyrinthPlayer from '@src/game/cards/12-labyrinth/LeaderLabyrinthPlayer'
import LeaderLabyrinthOpponent from '@src/game/cards/12-labyrinth/LeaderLabyrinthOpponent'
import RulesetLabyrinthRunCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthRunCamp'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import RulesetLabyrinthMetaCamp from '@src/game/rulesets/labyrinth/service/RulesetLabyrinthMetaCamp'
import AIBehaviour from '@shared/enums/AIBehaviour'

export default class RulesetLabyrinthBase extends ServerRulesetBuilder<never> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.LABYRINTH,
		})

		this.updateConstants({
			FIRST_GROUP_MOVES_FIRST: true,
			UNIT_HAND_SIZE_STARTING: 0,
		})

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.setFixedLink(RulesetLabyrinthRunCamp)

		this.createChain()
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanGroup())
			.setFixedLink(RulesetLabyrinthMetaCamp)

		this.createSlots()
			.addGroup({ type: 'player', deck: [LeaderLabyrinthPlayer] })
			.addGroup({ type: 'ai', deck: [LeaderLabyrinthOpponent], behaviour: AIBehaviour.DEFAULT })

		this.createCallback(GameEventType.GAME_CREATED).perform(({ game }) => {
			const state = game.progression.labyrinth.state.run
			const playerGroup = game.getHumanGroup()
			playerGroup.players.forEach((player) => {
				state.cards.forEach((card) => {
					for (let i = 0; i < card.count; i++) {
						player.cardDeck.addUnitToBottom(CardLibrary.instantiateFromClass(game, card.class))
					}
				})
				state.items.forEach((card) => {
					player.cardHand.addSpell(CardLibrary.instantiateFromClass(game, card.cardClass))
				})
			})
		})

		this.createCallback(GameEventType.GAME_FINISHED).perform(({ game, victoriousPlayer }) => {
			game.progression.labyrinth.addEncounterToHistory(this.class)
			if (victoriousPlayer !== game.getHumanGroup()) {
				game.progression.labyrinth.failRun()
			}
		})
	}
}
