import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../models/ServerCard'
import { DamageInstance } from '../../models/ServerDamageSource'
import ServerGame from '../../models/ServerGame'
import ServerUnit from '../../models/ServerUnit'

export default class TestingSpellQuickStrike extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(DamageInstance.fromCard(1, this))
	}
}
