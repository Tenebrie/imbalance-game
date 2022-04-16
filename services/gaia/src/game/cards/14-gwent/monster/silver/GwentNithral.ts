import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentNithral extends ServerCard {
	public static readonly BASE_DAMAGE = 6
	public static readonly EXTRA_DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.OFFICER],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			baseDamage: GwentNithral.BASE_DAMAGE,
			extraDamage: GwentNithral.EXTRA_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Nithral',
				description: 'Deal {baseDamage} to an enemy.<p>Increase damage by {extraDamage} for each Wild Hunt unit in your hand.',
				flavor:
					"Each Wild Hunt warrior has gone through a rigorous selection process, but Eredin's personal cavalcade includes only the most brutal and most ferocious of the Aen Elle.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const wildHuntUnitCount = this.ownerPlayer.cardHand.allCards.filter((card) => card.tribes.includes(CardTribe.WILD_HUNT)).length
				const damage = GwentNithral.BASE_DAMAGE + wildHuntUnitCount * GwentNithral.EXTRA_DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})
	}
}
