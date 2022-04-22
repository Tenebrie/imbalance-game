import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getStableRandomValues } from '@src/utils/Utils'

export default class GwentTrissTelekinesis extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.TEMERIA],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Triss: Telekinesis`,
				description: `*Create* a Bronze special card from either player's starting deck.`,
				flavor: `Bindings won't suffice. Nor will a gag render her any less dangerous. No, dimeritium is the only solution.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard, player }) =>
				getStableRandomValues(
					this,
					CardLibrary.cards
						.filter((card) => card.type === CardType.SPELL)
						.filter((card) => card.color === CardColor.BRONZE)
						.filter((card) => {
							const ownStartingDeck = player.startingDeck
							const opponentStartingDeck = player.opponent.players[0].startingDeck
							return (
								ownStartingDeck.unitCards.some((startingCard) => startingCard.class === card.class) ||
								opponentStartingDeck.unitCards.some((startingCard) => startingCard.class === card.class)
							)
						})
				).includes(targetCard)
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
