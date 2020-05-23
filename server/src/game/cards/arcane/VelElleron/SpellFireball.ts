import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'

export default class SpellFireball extends ServerCard {
	baseDamage = 4
	baseAreaDamage = 2

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 6
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage,
			areaDamage: () => this.areaDamage
		}
	}

	get damage() {
		return this.baseDamage
	}

	get areaDamage() {
		return this.baseAreaDamage
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.universeAttacksUnits([target], this.damage))
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))

		const areaTargets = this.game.board.getAdjacentUnits(target)
		if (areaTargets.length === 0) {
			return
		}

		this.game.animation.play(ServerAnimation.universeAttacksUnits(areaTargets, this.areaDamage))
		areaTargets.forEach(sideTarget => sideTarget.dealDamage(ServerDamageInstance.fromCard(this.areaDamage, this)))
	}
}
