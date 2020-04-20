import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import SimpleTargetDefinitionBuilder from '../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../models/ServerUnit'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import BuffSparksExtraDamage from '../../buffs/BuffSparksExtraDamage'
import CardFeature from '@shared/enums/CardFeature'

export default class SpellSpark extends ServerCard {
	baseDamage = 2

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN)

		this.basePower = 1
		this.features = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage
		}
	}

	get damage() {
		return this.baseDamage + this.game.board.getTotalBuffIntensityForPlayer(BuffSparksExtraDamage, this.owner)
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromSpell(this.damage, this))
	}
}
