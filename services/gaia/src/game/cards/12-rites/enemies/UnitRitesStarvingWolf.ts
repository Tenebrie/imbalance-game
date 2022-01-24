import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitRitesStarvingWolf extends ServerCard {
	damage = asRecurringUnitDamage(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
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
				description: '*Auto:*\nOne of the *Starving Wolves* deals {damage} Damage to closest enemies.',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.isHuman)
			.require(() => {
				const allStarvingWolves = game.board.getUnitsOwnedByPlayer(this.ownerPlayer).map((unit) => unit.card)
				return allStarvingWolves.indexOf(this) === game.turnIndex
			})
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
