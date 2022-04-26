import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentVriheddDragoon extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vrihedd Dragoon`,
				description: `Boost a random non-*Spying* unit in your hand by *${GwentVriheddDragoon.BOOST}* on turn end.`,
				flavor: `Most terrible things I've witnessed? The Catriona plague, the razing of Vengerberg and the charge of the Vrihedd Dragoons.`,
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const units = this.ownerPlayer.cardHand.allCards.filter(
					(card) => card.type === CardType.UNIT && !card.features.includes(CardFeature.SPY)
				)

				const targetUnit = getRandomArrayValue(units)
				if (!targetUnit) {
					return
				}

				targetUnit.boostBy(GwentVriheddDragoon.BOOST, this)
			})
	}
}
