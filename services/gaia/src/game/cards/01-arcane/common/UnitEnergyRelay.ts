import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

import Keywords from '../../../../utils/Keywords'
import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitEnergyRelay extends ServerCard {
	infuseCost = 1
	damageDealt = asRecurringUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			damageDealt: this.damageDealt,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.require(() => this.ownerPlayer.spellMana >= this.infuseCost)
			.perform(() => Keywords.infuse(this, this.infuseCost))
			.perform(() => this.onDealDamage())
	}

	private onDealDamage(): void {
		const triggeringUnit = this.unit!
		const opposingEnemies = this.game.board
			.getSplashableUnitsForOpponentOf(this.ownerPlayerNullable)
			.filter((unit) => this.game.board.getHorizontalUnitDistance(unit, triggeringUnit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, triggeringUnit) - this.game.board.getVerticalUnitDistance(b, triggeringUnit)
			})

		if (opposingEnemies.length === 0) {
			return
		}

		const shortestDistance = this.game.board.getVerticalUnitDistance(opposingEnemies[0], triggeringUnit)
		const targets = opposingEnemies.filter((unit) => this.game.board.getVerticalUnitDistance(unit, triggeringUnit) === shortestDistance)

		targets.forEach((unit) => {
			this.game.animation.createInstantAnimationThread()
			unit.dealDamage(DamageInstance.fromUnit(this.damageDealt, triggeringUnit))
			this.game.animation.commitAnimationThread()
		})
	}
}
