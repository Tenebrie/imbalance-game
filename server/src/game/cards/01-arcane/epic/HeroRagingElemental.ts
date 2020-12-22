import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroRagingElemental extends ServerCard {
	isEffectTriggered = false

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_ENRAGE],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			power: () => this.stats.power,
		}

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard === this)
			.require(({ triggeringCard }) => triggeringCard.stats.power > 0)
			.perform(() => this.onDamageSurvived())
	}

	private onDamageSurvived(): void {
		if (this.isEffectTriggered) {
			return
		}

		this.isEffectTriggered = true

		const thisUnit = this.unit!
		const opposingEnemies = this.game.board
			.getUnitsOwnedByOpponent(this.ownerInGame)
			.filter((unit) => this.game.board.getHorizontalUnitDistance(unit, thisUnit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, thisUnit) - this.game.board.getVerticalUnitDistance(b, thisUnit)
			})

		if (opposingEnemies.length === 0) {
			return
		}

		const shortestDistance = this.game.board.getVerticalUnitDistance(opposingEnemies[0], thisUnit)
		const targets = opposingEnemies
			.filter((unit) => this.game.board.getVerticalUnitDistance(unit, thisUnit) === shortestDistance)
			.concat([thisUnit])

		const damage = this.stats.power
		targets.forEach((unit) => {
			unit.dealDamage(ServerDamageInstance.fromUnit(damage, thisUnit))
		})
	}
}
