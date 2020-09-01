import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import {UnitCreatedEventArgs} from '../../../models/GameEventCreators'

export default class HeroForksmanshipInstructor extends ServerCard {
	powerThreshold = 4
	bonusPower = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.CASTLE,
			stats: {
				power: 8,
			}
		})
		this.dynamicTextVariables = {
			powerThreshold: this.powerThreshold,
			bonusPower: this.bonusPower
		}

		this.createCallback<UnitCreatedEventArgs>(GameEventType.UNIT_CREATED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card !== this)
			.require(({ triggeringUnit }) => triggeringUnit.owner === this.owner)
			.require(({ triggeringUnit }) => triggeringUnit.card.stats.power <= this.powerThreshold)
			.perform(({ triggeringUnit }) => {
				triggeringUnit.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
			})
	}
}
