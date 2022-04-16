import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asDirectUnitDamage, asSplashUnitDamage } from '@src/utils/LeaderStats'

import BuffCanAttack from '../../../buffs/BuffCanAttack'
import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitBloodyTrebuchet extends ServerCard {
	damage = asDirectUnitDamage(5)
	splashDamage = asSplashUnitDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			stats: {
				power: 12,
				armor: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			splashDamage: this.splashDamage,
		}

		this.createSelfSelector()
			.require(() => this.location === CardLocation.BOARD)
			.require(() => {
				return this.game.board.getAdjacentUnits(this.unit).filter((unit) => unit.card.tribes.includes(CardTribe.SOLDIER)).length >= 2
			})
			.provideSelf(BuffCanAttack)

		this.createOrderTargets(TargetType.UNIT)
			.targetCount(() => this.buffs.getIntensity(BuffCanAttack))
			.requireEnemy()

		this.createEffect(GameEventType.UNIT_ORDERED_UNIT).perform(({ targetCard, targetUnit }) => {
			const rowBehindTarget = this.game.board.getRowWithDistanceToFront(
				targetCard.ownerPlayer,
				this.game.board.getDistanceToStaticFront(targetUnit.rowIndex) + 1
			)
			const unitsBehind = rowBehindTarget.getUnitsWithinHorizontalDistance(targetUnit, 1)
			this.game.animation.thread(() => {
				targetCard.dealDamage(DamageInstance.fromCard(this.damage, this))
			})
			unitsBehind.forEach((unit) => {
				this.game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromCard(this.splashDamage, this))
				})
			})
		})
	}
}
