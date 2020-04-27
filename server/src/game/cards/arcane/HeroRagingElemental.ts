import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerAnimation from '../../models/ServerAnimation'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroRagingElemental extends ServerCard {
	powerThreshold = 6
	isEffectTriggered = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 9
		this.dynamicTextVariables = {
			powerThreshold: this.powerThreshold
		}
	}

	public onPowerChanged(newValue: number): void {
		if (this.power >= this.powerThreshold || this.power === 0 || this.isEffectTriggered) {
			return
		}

		this.isEffectTriggered = true

		const opposingEnemies = this.game.board.getUnitsOwnedByOpponent(this.owner)
			.filter(unit => this.game.board.getHorizontalUnitDistance(unit, this.unit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, this.unit) - this.game.board.getVerticalUnitDistance(b, this.unit)
			})

		if (opposingEnemies.length === 0) {
			return
		}

		const shortestDistance = this.game.board.getVerticalUnitDistance(opposingEnemies[0], this.unit)
		const targets = [this.unit].concat(opposingEnemies.filter(unit => this.game.board.getVerticalUnitDistance(unit, this.unit) === shortestDistance))

		const damage = this.power
		this.game.animation.play(ServerAnimation.unitAttack(this.unit, targets, damage))
		targets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(damage, this.unit))
		})
	}
}
