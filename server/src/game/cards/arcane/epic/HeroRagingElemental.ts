import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import {CardTakesDamageEventArgs} from '../../../models/GameEventCreators'

export default class HeroRagingElemental extends ServerCard {
	isEffectTriggered = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 9

		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE)
			.require(({ triggeringCard }) => triggeringCard === this)
			.require(({ triggeringCard }) => triggeringCard.power > 0)
			.perform(() => this.onDamageSurvived())
	}

	public onDamageSurvived(): void {
		if (this.isEffectTriggered) {
			return
		}

		this.isEffectTriggered = true

		const thisUnit = this.unit
		const opposingEnemies = this.game.board.getUnitsOwnedByOpponent(this.owner)
			.filter(unit => this.game.board.getHorizontalUnitDistance(unit, thisUnit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, thisUnit) - this.game.board.getVerticalUnitDistance(b, thisUnit)
			})

		if (opposingEnemies.length === 0) {
			return
		}

		const shortestDistance = this.game.board.getVerticalUnitDistance(opposingEnemies[0], thisUnit)
		const targets = [thisUnit].concat(opposingEnemies.filter(unit => this.game.board.getVerticalUnitDistance(unit, thisUnit) === shortestDistance))

		const damage = this.power
		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, targets))
		targets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(damage, thisUnit))
		})
	}
}
