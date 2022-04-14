import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDwarvenMercenary extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentDwarvenMercenary.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Dwarven Mercenary',
				description: "Move a unit to this row on its side. If it's an ally, boost it by 3.",
				flavor: "The key's mixin' pleasure an' business – like smackin' foes and gettin' coin for it.",
			},
		})
		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetUnit }) => {
				const triggeringUnit = this.unit!
				const thisUnitDistance = game.board.getDistanceToFront(triggeringUnit.owner, triggeringUnit.rowIndex)
				const targetRow = game.board.getRowWithDistanceToFront(targetUnit.owner, thisUnitDistance)
				if (targetRow.isFull()) {
					return false
				}
				const targetDistance = game.board.getDistanceToFront(targetUnit.owner, targetUnit.rowIndex)

				return thisUnitDistance !== targetDistance
			})
			.perform(({ targetUnit }) => {
				const triggeringUnit = this.unit!
				const distance = game.board.getDistanceToFront(triggeringUnit.owner, triggeringUnit.rowIndex)
				const targetRow = game.board.getRowWithDistanceToFront(targetUnit.owner, distance)

				if (targetRow.isFull()) {
					return
				}

				Keywords.moveUnit(targetUnit, targetRow.index, triggeringUnit.boardRow.farRightUnitIndex)

				if (targetUnit.owner.owns(this)) {
					targetUnit.buffs.addMultiple(BuffStrength, GwentDwarvenMercenary.BOOST, this)
				}
			})
	}
}
