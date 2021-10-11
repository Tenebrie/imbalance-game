import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffExtraArmor from '@src/game/buffs/BuffExtraArmor'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'
import { AnyCardLocation } from '@src/utils/Utils'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitArmorMender extends ServerCard {
	bonusArmor = asRecurringBuffPotency(4)
	activationsThisTurn = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: [CardTribe.COMMONER],
			faction: CardFaction.HUMAN,
			stats: {
				power: 20,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusArmor: this.bonusArmor,
			isReady: () => this.activationsThisTurn === 0 && this.location === CardLocation.BOARD,
			isNotReady: () => this.activationsThisTurn > 0 && this.location === CardLocation.BOARD,
		}

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(() => this.activationsThisTurn === 0)
			.require(({ powerDamageInstance }) => !!powerDamageInstance)
			.require(({ triggeringCard }) => triggeringCard !== this)
			.require(({ triggeringCard }) => triggeringCard.stats.power > 0)
			.require(({ triggeringCard }) => triggeringCard.ownerPlayerNullable === this.ownerPlayerNullable)
			.require(({ triggeringCard }) => triggeringCard.ownerPlayerNullable === this.ownerPlayerNullable)
			.perform(({ triggeringCard }) => {
				triggeringCard.buffs.addMultiple(BuffExtraArmor, this.bonusArmor, this)
				this.activationsThisTurn += 1
			})
		this.createCallback(GameEventType.TURN_ENDED, AnyCardLocation)
			.require(() => this.activationsThisTurn > 0)
			.perform(() => (this.activationsThisTurn = 0))
	}
}
