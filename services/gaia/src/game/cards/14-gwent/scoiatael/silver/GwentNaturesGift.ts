import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentNaturesGift extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Nature's Gift`,
				description: `Play a Bronze or Silver special card from your deck.`,
				flavor: `You exact from the earth a blood ransom, ripping out its riches by force. To us it bloomed, bore fruit and gave freely, for it loved us as we loved it.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.SPELL)
			.require(({ targetCard }) => targetCard.isBronzeOrSilver)
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
