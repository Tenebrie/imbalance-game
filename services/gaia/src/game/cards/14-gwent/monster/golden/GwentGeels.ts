import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentGeels extends ServerCard {
	private cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.OFFICER],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: "Ge'els",
				description: 'Look at a random Gold and a random Silver card from your deck.\nPlay one and move the other to the top of the deck.',
				flavor: 'Paintings should convey emotion, not words.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const goldenCards = owner.cardDeck.allCards.filter((card) => card.color === CardColor.GOLDEN)
			const silverCards = owner.cardDeck.allCards.filter((card) => card.color === CardColor.SILVER)
			const targetGoldenCard = getRandomArrayValue(goldenCards)
			const targetSilverCard = getRandomArrayValue(silverCards)
			this.cardsToChoose = []
			if (targetGoldenCard) {
				this.cardsToChoose.push(targetGoldenCard)
			}
			if (targetSilverCard) {
				this.cardsToChoose.push(targetSilverCard)
			}
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard, player }) => {
				const otherCards = this.cardsToChoose.filter((card) => card !== targetCard)
				otherCards.forEach((card) => {
					player.cardDeck.removeCard(card)
					player.cardDeck.addUnitToTop(card)
				})
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
