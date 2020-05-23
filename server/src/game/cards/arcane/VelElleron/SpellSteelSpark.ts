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
import BuffSparksExtraDamage from '../../../buffs/BuffSparksExtraDamage'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'

export default class SpellSteelSpark extends ServerCard {
	baseDamage = 2
	baseSideDamage = 1

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 2
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage,
			sideDamage: () => this.sideDamage
		}
	}

	get damage() {
		return this.baseDamage + this.game.board.getTotalBuffIntensityForPlayer(BuffSparksExtraDamage, this.owner)
	}

	get sideDamage() {
		return this.baseSideDamage + this.game.board.getTotalBuffIntensityForPlayer(BuffSparksExtraDamage, this.owner)
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

		const sideTargets = this.game.board.getAdjacentUnits(target).filter(unit => unit.rowIndex === target.rowIndex)
		if (sideTargets.length === 0) {
			return
		}

		this.game.animation.play(ServerAnimation.universeAttacksUnits(sideTargets, this.sideDamage))
		sideTargets.forEach(sideTarget => sideTarget.dealDamage(ServerDamageInstance.fromCard(this.sideDamage, this)))
	}
}
