import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import DamageSource from '@shared/enums/DamageSource'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { asRecurringBuffPotency, asRecurringUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'
import UnitRitesStarvingWolf from './UnitRitesStarvingWolf'

export default class UnitRitesWolfpackAlpha extends ServerCard {
	damage = asRecurringUnitDamage(3)
	powerGained = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			features: [CardFeature.RITES_ACTIVE_ENEMY],
			stats: {
				power: 20,
				armor: 0,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			powerGained: this.powerGained,
		}

		this.createLocalization({
			en: {
				name: 'Wolfpack Alpha',
				description:
					'Whenever an allied *Starving Wolf* deals Power damage to an enemy, gain +{powerGained} Power.<p>*Action:*\nDeal {damage} Damage to a closest enemy.',
			},
		})

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(
				({ powerDamageInstance }) =>
					!!powerDamageInstance &&
					powerDamageInstance.source === DamageSource.CARD &&
					powerDamageInstance.sourceCard instanceof UnitRitesStarvingWolf
			)
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, this.powerGained, this)
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
