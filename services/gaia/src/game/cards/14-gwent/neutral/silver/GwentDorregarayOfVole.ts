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

export default class GwentDorregarayOfVole extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Dorregaray of Vole`,
				description: `*Create* any Bronze or Silver Beast or Draconid.`,
				flavor: `Like the witchers, Dorregaray is a monster aficionado, though he's developed his own classification system. Instead of dividing them into necrophages, ogroids and the like, he just thinks they're all wonderful.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) =>
				getStableRandomValues(
					this,
					CardLibrary.cards
						.filter((card) => card.isCollectible)
						.filter((card) => card.tribes.includes(CardTribe.BEAST) || card.tribes.includes(CardTribe.DRACONID))
						.filter((card) => card.isBronzeOrSilver)
				).includes(targetCard)
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
