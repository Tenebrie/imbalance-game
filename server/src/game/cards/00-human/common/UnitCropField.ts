import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'
import CardTribe from '@shared/enums/CardTribe'
import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitCropField extends ServerCard {
	bonusPower = asDirectBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH],
			stats: {
				power: 0,
				armor: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.ownerInGame)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const adjacentUnits = this.game.board.getAdjacentUnits(this.unit)
		const procCount = 1 + adjacentUnits.filter((unit) => unit.card.tribes.includes(CardTribe.PEASANT)).length
		for (let i = 0; i < procCount; i++) {
			const validUnits = this.game.board
				.getUnitsOwnedByPlayer(this.owner)
				.filter((unit) => !unit.card.features.includes(CardFeature.BUILDING))
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
