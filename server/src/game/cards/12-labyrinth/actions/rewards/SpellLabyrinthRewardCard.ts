import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation, shuffle } from '@src/utils/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import Keywords from '@src/utils/Keywords'
import { sortCards } from '@shared/Utils'

export default class SpellLabyrinthRewardCard extends ServerCard {
	public static readonly REWARDS_OFFERED = 50

	cardsToChooseFrom: ServerCard[] = []

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
			const validCards = CardLibrary.cards.filter((card) => card.tribes.includes(CardTribe.LABYRINTH_BUCKET))
			this.cardsToChooseFrom = sortCards(shuffle(validCards).slice(0, SpellLabyrinthRewardCard.REWARDS_OFFERED))
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsToChooseFrom.includes(targetCard))
			.preventSorting()
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
