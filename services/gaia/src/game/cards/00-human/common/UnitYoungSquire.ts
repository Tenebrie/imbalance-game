import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import LeaderStatType from '@shared/enums/LeaderStatType'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class UnitYoungSquire extends ServerCard {
	movingUnit: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.NOBLE, CardTribe.SOLDIER],
			faction: CardFaction.HUMAN,
			stats: {
				power: 8,
				[LeaderStatType.DIRECT_UNIT_DAMAGE]: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(() => !this.movingUnit)
			.label('card.spellTacticalMove.target.label.unit')
			.perform(({ targetUnit }) => (this.movingUnit = targetUnit))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)
			.require(({ targetRow }) => Math.abs(targetRow.index - this.movingUnit!.rowIndex) <= 1)
			.label('card.spellTacticalMove.target.label.row')
			.perform(({ targetRow, targetPosition }) => {
				Keywords.moveUnit(this.movingUnit!, targetRow, targetPosition)
			})
			.finalize(() => (this.movingUnit = null))
	}
}
