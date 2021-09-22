import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardColor from '@shared/enums/CardColor'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderVelElleron from '@src/game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import CardLibrary, { CardConstructor } from '@src/game/libraries/CardLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import { ServerBotPlayerInGame } from '@src/game/players/ServerPlayerInGame'
import { shuffle } from '@src/utils/Utils'

type ExtraProps = {
	agentId: string
}

type Response = {
	victoriousAgent: 'random' | 'overmind' | 'draw'
}

export default class RulesetOvermindEvaluation extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: false,
				ROUND_WINS_REQUIRED: 1,
				UNIT_HAND_SIZE_STARTING: 5,
			},
			hiddenFromMenu: true,
		})

		const generateRandomDeck = (): CardConstructor[] => {
			const commonCards = Constants.CARD_COPIES_LIMIT_BRONZE
			const epicCards = Constants.CARD_COPIES_LIMIT_SILVER
			const legendaryCards = Constants.CARD_COPIES_LIMIT_GOLDEN

			const validCommons = CardLibrary.cards.filter((card) => card.color === CardColor.BRONZE && card.isCollectible)
			const validEpics = CardLibrary.cards.filter((card) => card.color === CardColor.SILVER && card.isCollectible)
			const validLegendaries = CardLibrary.cards.filter((card) => card.color === CardColor.GOLDEN && card.isCollectible)

			return [
				...shuffle(validCommons).slice(0, commonCards),
				...shuffle(validEpics).slice(0, epicCards),
				...shuffle(validLegendaries).slice(0, legendaryCards),
			].map((card) => card.constructor as CardConstructor)
		}

		this.createSlots()
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.RANDOM,
				deck: [LeaderVelElleron, ...generateRandomDeck()],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.OVERMIND,
				deck: [LeaderVelElleron, ...generateRandomDeck()],
			})
	}

	public runSimulation(props: ExtraProps): Promise<Response> {
		return new Promise<Response>((resolve) => {
			const players = this.game.players.flatMap((group) => group.players) as ServerBotPlayerInGame[]
			players[1].setOvermindId(props.agentId)

			this.createCallback(GameEventType.GAME_FINISHED).perform(({ victoriousPlayer }) => {
				resolve({
					victoriousAgent: victoriousPlayer === null ? 'draw' : victoriousPlayer.index === 0 ? 'random' : 'overmind',
				})
			})
			this.game.start()
		})
	}
}
