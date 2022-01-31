import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStun from '@src/game/buffs/BuffStun'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { asDirectEffectDuration, asDirectSpellDamage } from '@src/utils/LeaderStats'

import LeaderRitesPlayerUnit from '../LeaderRitesPlayerUnit'

export default class SpellRitesRamIt extends ServerCard {
	private baseDamage = asDirectSpellDamage(2)
	private damagePerRow = asDirectSpellDamage(5)
	private stunPerRow = asDirectEffectDuration(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damagePerRow: this.damagePerRow,
			stunPerRow: this.stunPerRow,
		}

		this.createLocalization({
			en: {
				name: 'Ram It!',
				description:
					'Charge at an enemy on a front row, dealing {baseDamage} + {damagePerRow} Damage per row charged.\nApply Stun for {stunPerRow} turn(s) per row charged.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => game.board.getDistanceToDynamicFrontForPlayer(targetUnit.rowIndex, targetUnit.owner) === 0)
			.perform(({ targetUnit }) => {
				const targetRow = game.board.getRowWithDistanceToFront(this.ownerPlayer, 0)
				const targetPosition = Array(targetRow.cards.length + 1)
					.fill(0)
					.map((_, index) => index)
					.map((index) => ({
						index,
						distance: game.board.getHorizontalUnitDistance(targetUnit, { rowIndex: targetRow.index, unitIndex: index, extraUnits: 1 }),
					}))
					.sort((a, b) => a.distance - b.distance || a.index - b.index)[0].index

				const hero = game.board.getAllUnits().find((unit) => unit.card instanceof LeaderRitesPlayerUnit)!
				const chargedDistance = Math.abs(hero.rowIndex - targetRow.index)
				game.board.moveUnit(hero, targetRow.index, targetPosition)

				game.animation.thread(() => {
					targetUnit.dealDamage(DamageInstance.fromUnit(this.baseDamage(this) + this.damagePerRow(this) * chargedDistance, hero))
				})
				game.animation.thread(() => {
					targetUnit.buffs.add(BuffStun, hero.card, chargedDistance * this.stunPerRow(this))
				})
				game.animation.syncAnimationThreads()
			})
	}
}
