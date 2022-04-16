import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BuffExtraArmor from '../../../buffs/BuffExtraArmor'

export default class UnitGenerousBlacksmith extends ServerCard {
	bonusArmor = asRecurringBuffPotency(6)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusArmor: this.bonusArmor,
		}

		this.createCallback(GameEventType.UNIT_MOVED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card !== this)
			.require(({ fromRow, toRow }) => fromRow !== toRow)
			.require(({ toRow, toIndex }) => toRow.index === this.unit!.rowIndex && Math.abs(toIndex - this.unit!.unitIndex) === 1)
			.requireImmediate(({ triggeringUnit }) => triggeringUnit.isAlive())
			.perform(({ triggeringUnit }) => {
				triggeringUnit.buffs.addMultiple(BuffExtraArmor, this.bonusArmor, this)
			})
	}
}
