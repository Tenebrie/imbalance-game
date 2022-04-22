import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentMyrgtabrakke extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly TARGETS = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Myrgtabrakke`,
				description: `Deal *${GwentMyrgtabrakke.DAMAGE}* damage. Repeat *${GwentMyrgtabrakke.TARGETS}* times.`,
				flavor: `Never get between a mother dragon and her young.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(GwentMyrgtabrakke.TARGETS)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentMyrgtabrakke.DAMAGE, this))
			})
	}
}
