import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../../models/ServerCard'
import { DamageInstance } from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'

export default class GwentParasite extends ServerCard {
	public static readonly DAMAGE = 12
	public static readonly BOOST = 12

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentParasite.DAMAGE,
			boost: GwentParasite.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Parasite',
				description: 'Deal {damage} damage to an enemy; or Boost an ally by {boost}.',
				flavor: 'A real eye-catcher.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(1)
			.requireAllied()
			.perform(({ targetUnit }) => {
				targetUnit.card.buffs.addMultiple(BuffStrength, GwentParasite.BOOST, this)
			})
			.label(`Boost by ${GwentParasite.BOOST}`)

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(1)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentParasite.DAMAGE, this))
			})
			.label(`Deal ${GwentParasite.DAMAGE} damage`)
	}
}
