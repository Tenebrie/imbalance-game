import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringUnitDamage, asSplashUnitDamage } from '@src/utils/LeaderStats'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitRitesPoisonArcana extends ServerCard {
	damage = asSplashUnitDamage(5)
	autoDamage = asRecurringUnitDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.SPY],
			stats: {
				power: 0,
				armor: 3,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			autoDamage: this.autoDamage,
		}

		this.createLocalization({
			en: {
				name: 'Poison Arcana',
				description: '*Deploy:*\nDeal {damage} Damage to adjacent units.<p>*Auto:*\nDeal {autoDamage} Damage to adjacent units.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
			adjacentUnits.forEach((unit) => {
				this.game.animation.instantThread(() => {
					unit.dealDamage(DamageInstance.fromCard(this.damage, this))
				})
			})
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => !group.owns(this))
			.perform(() => {
				const triggeringUnit = this.unit!
				const targets = this.game.board.getAdjacentUnits(triggeringUnit)

				targets.forEach((unit) => {
					this.game.animation.instantThread(() => {
						unit.dealDamage(DamageInstance.fromUnit(this.autoDamage, triggeringUnit))
					})
				})
				this.game.animation.syncAnimationThreads()
			})
	}
}
