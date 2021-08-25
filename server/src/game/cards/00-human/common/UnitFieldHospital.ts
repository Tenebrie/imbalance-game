import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import { asRecurringHealingPotency } from '@src/utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitFieldHospital extends ServerCard {
	healing = asRecurringHealingPotency(4)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH, CardFeature.KEYWORD_HEAL],
			stats: {
				power: 0,
				armor: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: this.healing,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
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
