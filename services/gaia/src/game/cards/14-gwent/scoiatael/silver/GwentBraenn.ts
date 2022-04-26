import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentBraenn extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Braenn`,
				description: `Deal damage equal to this unit's power. If a unit was destroyed, boost all your other Dryads and *Ambush* units in hand, deck, and on board by *${GwentBraenn.BOOST}*.`,
				flavor: `Mona…? No… no. I'm Braenn. A daughter of Brokilon.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit, player }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(this.stats.power, this))

				if (targetUnit.stats.power - this.stats.power <= 0) {
					game.board
						.getSplashableUnitsFor(player)
						.filter((unit) => unit.card.tribes.includes(CardTribe.DRYAD) || unit.card.features.includes(CardFeature.AMBUSH))
						.filter((unit) => unit !== this.unit)
						.forEach((unit) => unit.boostBy(GwentBraenn.BOOST, this))

					this.ownerPlayer.cardHand.allCards
						.filter((card) => card.tribes.includes(CardTribe.DRYAD) || card.features.includes(CardFeature.AMBUSH))
						.forEach((card) => card.boostBy(GwentBraenn.BOOST, this))

					this.ownerPlayer.cardDeck.allCards
						.filter((card) => card.tribes.includes(CardTribe.DRYAD) || card.features.includes(CardFeature.AMBUSH))
						.forEach((card) => card.boostBy(GwentBraenn.BOOST, this))
				}
			})
	}
}
