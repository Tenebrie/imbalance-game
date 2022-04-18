import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffProtector from '@src/game/buffs/BuffProtector'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'

/* Original design and implementation by Nenl */
export default class UnitHelplessPeasants extends ServerCard {
	selfBuff = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			selfBuff: this.selfBuff,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner, triggeringUnit }) => {
			const secondWeakling = new UnitHelplessPeasants(this.game)
			this.game.board.createUnit(secondWeakling, owner, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnEnded())
	}

	private onTurnEnded(): void {
		const thisUnit = this.unit
		if (!thisUnit) {
			return
		}
		const unitDistance = this.game.board.getDistanceToFront(thisUnit.rowIndex)
		const isProtected = this.game.board
			.getUnitsOwnedByGroup(thisUnit.owner)
			.some(
				(anotherUnit) =>
					this.game.board.getDistanceToFront(anotherUnit.rowIndex) < unitDistance &&
					this.game.board.getHorizontalUnitDistance(thisUnit, anotherUnit) < 1 &&
					anotherUnit.card.buffs.has(BuffProtector)
			)

		if (isProtected) {
			thisUnit.buffs.addMultiple(BuffStrength, this.selfBuff, this)
		}
	}
}
