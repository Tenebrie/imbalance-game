import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentCiri extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CINTRA, CardTribe.WITCHER],
			stats: {
				power: 6,
				armor: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ciri`,
				description: `Whenever you lose a round, return this unit to your hand.`,
				flavor: `I go wherever I please, whenever I please.`,
			},
		})

		this.createCallback(GameEventType.ROUND_FINALIZED, [CardLocation.GRAVEYARD])
			.require(({ losingGroup }) => !!losingGroup && losingGroup.owns(this))
			.perform(() => {
				Keywords.returnCardFromGraveyardToHand(this)
			})
	}
}
