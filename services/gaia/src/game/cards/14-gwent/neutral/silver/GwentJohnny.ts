import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentJohnny extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 9,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Johnny`,
				description: `*Discard* a card. Then make a default copy of a card of the same color from your opponent's starting deck in your hand.`,
				flavor: `Life without savoring the sound of surreptitious shananacking is like licking snails through a cloth.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.perform(({ targetCard, player }) => {
				Keywords.discardCard(targetCard)
				const opponentStartingDeck = player.opponent.players[0].startingDeck
				const validCards = opponentStartingDeck.unitCards.filter((card) => card.color === targetCard.color)
				if (validCards.length === 0) {
					return
				}
				const selectedCard = getRandomArrayValue(validCards)
				Keywords.addCardToHand.for(player).fromInstance(selectedCard)
			})
	}
}
