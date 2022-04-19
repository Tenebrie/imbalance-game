import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentBitingFrost from '../../neutral/bronze/GwentBitingFrost'

export default class GwentJotunn extends ServerCard {
	public static readonly TARGETS = 3
	public static readonly BASE_DAMAGE = 2
	public static readonly FROST_DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBitingFrost],
		})
		this.dynamicTextVariables = {
			targets: GwentJotunn.TARGETS,
			baseDamage: GwentJotunn.BASE_DAMAGE,
			frostDamage: GwentJotunn.FROST_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Jotunn',
				description:
					'Move {targets} enemies to the row opposite this unit and deal {baseDamage} damage to them.\nIf that row is under *Biting Frost*, deal {frostDamage} damage instead.',
				flavor:
					'Skellige legend claims the mighty and terrible Jotunn, King of Giants, reigned over the isles in ancient times. He was slain by Hemdall, but with his dying breath he vowed to return for Ragh nar Roog.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(GwentJotunn.TARGETS)
			.requireEnemy()
			.require(() => this.unit !== null)
			.require(() => !game.board.getOppositeRow(this.unit!.rowIndex).isFull())
			.require(({ targetUnit }) => targetUnit.rowIndex !== game.board.getOppositeRow(this.unit!.rowIndex).index)
			.perform(({ targetUnit }) => {
				const oppositeRow = game.board.getOppositeRow(this.unit!.rowIndex)
				game.board.moveUnit(targetUnit, oppositeRow.index, oppositeRow.farRightUnitIndex)
				const damage = oppositeRow.buffs.has(BuffGwentRowFrost) ? GwentJotunn.FROST_DAMAGE : GwentJotunn.BASE_DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})
	}
}
