import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitRitesMajorFlameArcana extends ServerCard {
	damage = asRecurringUnitDamage(10)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 0,
				armor: 5,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createLocalization({
			en: {
				name: 'Major Flame Arcana',
				description: '*Auto:*\nDeal {damage} Damage to closest enemies.',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.isHuman)
			.perform(() => {
				const triggeringUnit = this.unit!
				const targets = game.board.getClosestEnemyUnits(triggeringUnit)

				targets.forEach((unit) => {
					this.game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromUnit(this.damage, triggeringUnit))
					})
				})
				this.game.animation.syncAnimationThreads()
			})
	}
}
