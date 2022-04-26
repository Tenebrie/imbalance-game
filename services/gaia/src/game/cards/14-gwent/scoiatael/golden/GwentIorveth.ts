import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentIorveth extends ServerCard {
	public static readonly DAMAGE = 8
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Iorveth`,
				description: `Deal *${GwentIorveth.DAMAGE}* damage to an enemy. If the unit was destroyed, boost all Elves in your hand by *${GwentIorveth.BOOST}*.`,
				flavor: `King or beggar, what's the difference? One dh'oine less.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentIorveth.DAMAGE, this))

				if (targetUnit.stats.power - GwentIorveth.DAMAGE <= 0) {
					console.log(this.ownerPlayer.cardHand.allCards)
					this.ownerPlayer.cardHand.allCards
						.filter((card) => card.tribes.includes(CardTribe.ELF))
						.forEach((card) => card.boostBy(GwentIorveth.BOOST, this))
				}
			})
	}
}
