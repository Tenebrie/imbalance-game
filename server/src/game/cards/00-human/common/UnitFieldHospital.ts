import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import { asSplashHealingPotency } from '@src/utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitFieldHospital extends ServerCard {
	healing = asSplashHealingPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.BUILDING],
			stats: {
				power: 0,
				armor: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: this.healing,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.ownerInGame)
			.perform(() => {
				const adjacentDamagedUnits = this.game.board
					.getAdjacentUnits(this.unit)
					.filter((unit) => unit.card.stats.power < unit.card.stats.maxPower)
				adjacentDamagedUnits.forEach((unit) => {
					this.game.animation.instantThread(() => {
						unit.card.heal(ServerDamageInstance.fromCard(this.healing, this))
					})
				})
			})
	}
}
