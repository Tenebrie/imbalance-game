import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDolBlathannaArcher extends ServerCard {
	public static readonly FIRST_ATTACK_POWER = 3
	public static readonly SECOND_ATTACK_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			firstAttackPower: GwentDolBlathannaArcher.FIRST_ATTACK_POWER,
			secondAttackPower: GwentDolBlathannaArcher.SECOND_ATTACK_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Dol Blathanna Archer',
				description: 'Deal *{firstAttackPower}* damage, then deal *{secondAttackPower}* damage.',
				flavor: "Take another step, dh'oine. You'd look better with an arrow between your eyes.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentDolBlathannaArcher.FIRST_ATTACK_POWER, this))
			})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentDolBlathannaArcher.SECOND_ATTACK_POWER, this))
			})
	}
}
