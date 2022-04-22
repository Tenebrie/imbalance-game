import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentRockBarrage extends ServerCard {
	public static readonly DAMAGE = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentRockBarrage.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Rock Barrage',
				description: 'Deal {damage} damage to an enemy and move it to the row above.\nIf the row is full, destroy the enemy instead.',
				flavor: 'Someday, when you are older, you could get hit by a boulder.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const targetUnitRow = targetUnit.boardRow
				const rowDistance = game.board.getDistanceToFront(targetUnitRow.index)
				const rowAbove = game.board.getRowWithDistanceToFrontNullable(targetUnit.owner, rowDistance + 1)

				targetUnit.dealDamage(DamageInstance.fromCard(GwentRockBarrage.DAMAGE, this))
				if (rowAbove === null || targetUnit.isDead) {
					return
				}
				if (rowAbove.isFull()) {
					Keywords.destroyUnit({
						unit: targetUnit,
						source: this,
					})
				} else {
					Keywords.moveUnit(targetUnit, rowAbove, rowAbove.farRightUnitIndex)
				}
			})
	}
}
