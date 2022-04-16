import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitVolatileCrystal extends ServerCard {
	damage = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createCallback(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card === this)
			.perform(({ triggeringUnit }) => {
				const damageTargets = this.game.board.getAdjacentUnits(triggeringUnit)

				damageTargets.forEach((unit) => {
					this.game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromUnit(this.damage, triggeringUnit))
					})
				})
			})
	}
}
