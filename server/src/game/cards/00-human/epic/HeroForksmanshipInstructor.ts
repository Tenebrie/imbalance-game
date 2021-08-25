import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'
import CardTribe from '@shared/enums/CardTribe'

export default class HeroForksmanshipInstructor extends ServerCard {
	bonusPower = asRecurringBuffPotency(6)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: [CardTribe.NOBLE, CardTribe.SOLDIER],
			faction: CardFaction.HUMAN,
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card !== this)
			.require(({ triggeringUnit }) => triggeringUnit.owner === this.owner)
			.require(({ triggeringUnit }) => triggeringUnit.card.tribes.includes(CardTribe.PEASANT))
			.perform(({ triggeringUnit }) => {
				triggeringUnit.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
			})
	}
}
