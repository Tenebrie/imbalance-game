import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitRitesStarvingWolf extends ServerCard {
	damage = asRecurringUnitDamage(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			features: [CardFeature.RITES_ACTIVE_ENEMY],
			stats: {
				power: 12,
				armor: 0,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createLocalization({
			en: {
				name: 'Starving Wolf',
				description: '*Action:*\nDeal {damage} Damage to a closest enemy.',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.isHuman)
			.require(() => this.features.includes(CardFeature.RITES_UNIT_CAN_ATTACK))
			.perform(() => {
				const triggeringUnit = this.unit!
				const target = game.board.getRandomClosestEnemyUnit(triggeringUnit)
				if (!target) {
					return
				}

				target.dealDamage(DamageInstance.fromUnit(this.damage, triggeringUnit))
			})
	}
}
