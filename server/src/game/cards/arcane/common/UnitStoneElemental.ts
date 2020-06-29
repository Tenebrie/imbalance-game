import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import TargetMode from '@shared/enums/TargetMode'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'
import ServerUnit from '../../../models/ServerUnit'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEvent from '../../../models/GameEvent'

export default class UnitStoneElemental extends ServerCard {
	canAttack = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 7
		this.baseAttack = 3
		this.baseAttackRange = 2
		this.baseTribes = [CardTribe.ELEMENTAL]

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => {
				this.canAttack = true
			})
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
			.actions(this.canAttack ? 1 : 0)
			.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT)
	}

	onPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode) {
		target.buffs.add(BuffStun, this, BuffDuration.END_OF_NEXT_TURN)
	}

	onTurnEnded() {
		this.canAttack = false
	}
}
