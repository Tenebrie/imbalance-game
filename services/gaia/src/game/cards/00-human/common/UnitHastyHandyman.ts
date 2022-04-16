import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerUnit from '../../../models/ServerUnit'

export default class UnitHastyHandyman extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require((args) => args.targetCard.stats.armor < args.targetCard.stats.maxArmor)
			.evaluate((args) => args.targetCard.stats.maxArmor - args.targetCard.stats.armor)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.card.restoreArmor(DamageInstance.fromCard(target.card.stats.maxArmor - target.card.stats.armor, this))
	}
}
