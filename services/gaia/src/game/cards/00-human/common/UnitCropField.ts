import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitCropField extends ServerCard {
	bonusPower = asRecurringBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH],
			stats: {
				power: 0,
				armor: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const adjacentUnits = this.game.board.getAdjacentUnits(this.unit)
		const procCount = 1 + adjacentUnits.filter((unit) => unit.card.tribes.includes(CardTribe.PEASANT)).length
		for (let i = 0; i < procCount; i++) {
			const validUnits = this.game.board.getUnitsOwnedByGroup(this.ownerGroupNullable)
			if (validUnits.length === 0) {
				return
			}

			const lowestPower = validUnits.map((unit) => unit.card.stats.power).sort((a, b) => a - b)[0]
			const lowestPowerAllies = validUnits.filter((unit) => unit.card.stats.power === lowestPower)
			if (lowestPowerAllies.length === 0) {
				return
			}

			this.game.animation.createAnimationThread()
			lowestPowerAllies[0].card.buffs.addMultiple(BuffStrength, this.bonusPower, this)
			this.game.animation.commitAnimationThread()
		}
	}
}
