import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerAnimation from '../../models/ServerAnimation'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../models/ServerUnit'

export default class HeroRagingElemental extends ServerCard {
	isEffectTriggered = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 9
	}

	public onDamageSurvived(thisUnit: ServerUnit, survivedDamage: ServerDamageInstance): void {
		if (this.isEffectTriggered) {
			return
		}

		this.isEffectTriggered = true

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
		this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, targets, damage))
		targets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(damage, thisUnit))
		})
	}
}
