import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerAnimation from '../../../models/ServerAnimation'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroRider1Famine extends ServerCard {
	damage = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 10
		this.baseAttack = 4
		this.dynamicTextVariables = {
			damage: this.damage
		}
	}

	onPlayedAsUnit(thisUnit: ServerUnit): void {
		const allEnemyUnits = this.game.board.getUnitsOwnedByPlayer(thisUnit.owner.opponent)
		allEnemyUnits.forEach(unit => unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, thisUnit)))
		this.game.animation.play(ServerAnimation.unitAttackDefault(thisUnit, allEnemyUnits))
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromUnit(1, thisUnit))
	}
}
