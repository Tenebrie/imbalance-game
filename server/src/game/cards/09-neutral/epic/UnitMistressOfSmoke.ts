import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import Utils from '../../../../utils/Utils'

export default class UnitMistressOfSmoke extends ServerCard {
	cardsToDiscard = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_DISCARD],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
			sortPriority: 1,
		})
		this.dynamicTextVariables = {
			cardsToDiscard: this.cardsToDiscard,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			let cardsToDiscard: number | undefined = this.cardsToDiscard
			if (!this.ownerInGame.cardDeck.hasDuplicates) {
				cardsToDiscard = undefined
			}
			const targetCards = Utils.sortCards(this.ownerInGame.cardHand.unitCards).slice(0, cardsToDiscard)
			targetCards.forEach((card) => this.ownerInGame.cardHand.discardCard(card))
			this.ownerInGame.drawUnitCards(targetCards.length)
		})
	}
}
