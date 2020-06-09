import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import ServerUnit from '../../../models/ServerUnit'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerDamageInstance from '../../../models/ServerDamageSource'

export default class UnitVolatileCrystal extends ServerCard {
	damage = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 1
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			damage: this.damage
		}
	}

	onBeforeDestroyedAsUnit(thisUnit: ServerUnit): void {
		const damageTargets = this.game.board.getAdjacentUnits(thisUnit).filter(unit => unit.rowIndex === thisUnit.rowIndex)

		this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, damageTargets))
		damageTargets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, thisUnit))
		})
	}
}
