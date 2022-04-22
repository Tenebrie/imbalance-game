import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentTrissMerigold extends ServerCard {
	public static readonly DAMAGE = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.TEMERIA],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Triss Merigold`,
				description: `Deal *${GwentTrissMerigold.DAMAGE}* damage.`,
				flavor: `I can take care of myself. Trust me.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentTrissMerigold.DAMAGE, this))
			})
	}
}
