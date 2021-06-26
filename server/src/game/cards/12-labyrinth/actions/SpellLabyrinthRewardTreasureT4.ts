import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation, shuffle } from '@src/utils/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'

export default class SpellLabyrinthRewardTreasureT4 extends ServerCard {
	public static readonly REWARDS_OFFERED = 4

	cardsChosen: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => chooseRewards())

		const chooseRewards = () => {
			this.cardsChosen = shuffle(CardLibrary.cards.filter((card) => card.features.includes(CardFeature.LABYRINTH_ITEM_T4))).slice(
				0,
				SpellLabyrinthRewardTreasureT4.REWARDS_OFFERED
			)
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsChosen.includes(targetCard))
			.perform(({ targetCard }) => {
				this.game.progression.labyrinth.addItemToDeck(targetCard.class)
			})
	}
}
