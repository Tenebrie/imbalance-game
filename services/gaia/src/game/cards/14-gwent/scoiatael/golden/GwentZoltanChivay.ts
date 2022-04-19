import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentZoltanChivay extends ServerCard {
	protected static readonly BOOST = 2
	protected static readonly DAMAGE = 2
	protected static readonly UNIT_COUNT = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentZoltanChivay.BOOST,
			damage: GwentZoltanChivay.DAMAGE,
			unitCount: GwentZoltanChivay.UNIT_COUNT,
		}

		this.createLocalization({
			en: {
				name: 'Zoltan Chivay',
				description:
					'Choose {unitCount} units. Strengthen allies by {boost} and move them to this row. Deal {damage} damage to enemies and move them to the row opposite this unit.',
				flavor: "Drinkin' alone's like crappin' with company.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(GwentZoltanChivay.UNIT_COUNT)
			.requireNotSelf()
			.require(({ targetUnit }) => targetUnit.boardRow !== this.unit!.boardRow)
			.require(({ targetUnit }) => targetUnit.boardRow !== game.board.getOppositeRow(this.unit!.boardRow))
			.require(({ targetUnit }) => {
				let targetRow = this.unit!.boardRow

				if (!targetUnit.owner.owns(this)) {
					targetRow = game.board.getOppositeRow(targetRow)
				}

				return targetRow.isNotFull()
			})
			.perform(({ targetUnit }) => {
				let targetRow = this.unit!.boardRow

				if (!targetUnit.owner.owns(this)) {
					targetRow = game.board.getOppositeRow(targetRow)
				}

				if (targetUnit.owner.owns(this)) {
					targetUnit.buffs.addMultiple(BuffBaseStrength, GwentZoltanChivay.BOOST, this)
				} else {
					targetUnit.dealDamage(DamageInstance.fromCard(GwentZoltanChivay.DAMAGE, this))
				}

				if (targetRow.isNotFull() && targetUnit.card.stats.power > 0) {
					Keywords.moveUnit(targetUnit, targetRow, targetRow.farRightUnitIndex)
				}
			})
	}
}
