import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../../../models/ServerCard'
import { DamageInstance } from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'

export default class GwentAddaStriga extends ServerCard {
	public static readonly DAMAGE = 8

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CURSED, CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentAddaStriga.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Adda: Striga',
				description: 'Deal {damage} damage to a non-Monster faction unit.',
				flavor: "And the striga's doin' fine. Sure, she takes a bite outta someone from time to time, but you get used to that.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.card.faction !== CardFaction.MONSTER)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentAddaStriga.DAMAGE, this))
			})
	}
}
