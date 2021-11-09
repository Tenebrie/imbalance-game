import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringHealingPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitFieldHospital extends ServerCard {
	healing = asRecurringHealingPotency(4)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH, CardFeature.APATHY],
			stats: {
				power: 0,
				armor: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: this.healing,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const adjacentDamagedUnits = this.game.board
					.getAdjacentUnits(this.unit)
					.filter((unit) => unit.card.stats.power < unit.card.stats.maxPower)
				adjacentDamagedUnits.forEach((unit) => {
					this.game.animation.instantThread(() => {
						unit.card.heal(DamageInstance.fromCard(this.healing, this))
					})
				})
			})
	}
}
