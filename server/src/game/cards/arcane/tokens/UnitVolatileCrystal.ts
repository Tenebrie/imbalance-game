import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import GameEvent from '../../../models/GameEvent'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitVolatileCrystal extends ServerCard {
	damage = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 1
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			damage: this.damage
		}

		this.createCallback(GameEvent.UNIT_DESTROYED)
			.requireLocation(CardLocation.BOARD)
			.require(({ targetUnit }) => targetUnit.card === this)
			.perform(() => this.onDestroy())
	}

	private onDestroy(): void {
		const unit = this.unit
		const damageTargets = this.game.board.getAdjacentUnits(unit).filter(unit => unit.rowIndex === unit.rowIndex)

		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, damageTargets))
		damageTargets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, unit))
		})
	}
}
