import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerAnimation from '../../../models/ServerAnimation'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'

export default class UnitStoneElemental extends ServerCard {
	damage = 4

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 7
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.dynamicTextVariables = {
			damage: this.damage
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.allow(TargetType.UNIT)
			.notSelf()
			.validate(TargetType.UNIT, args => {
				return args.targetUnit.card.power === 5
			})
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, [target], this.damage))
		target.dealDamage(ServerDamageInstance.fromUnit(this.damage, thisUnit))
	}
}
