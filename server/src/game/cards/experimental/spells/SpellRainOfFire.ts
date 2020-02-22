import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetType from '../../../shared/enums/TargetType'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import CardColor from '../../../shared/enums/CardColor'
import TargetMode from '../../../shared/enums/TargetMode'

export default class SpellRainOfFire extends ServerCard {
	damage = 12
	targets = 5

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.BRONZE)
		this.basePower = 5
		this.cardTextVariables = {
			damage: this.damage,
			targets: this.targets
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.enemyUnit()
			.unique(TargetType.UNIT)
			.multipleTargets(this.targets)
			.allow(TargetType.UNIT, this.targets)
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerCardOnBoard): void {
		target.dealDamage(ServerDamageInstance.fromSpell(this.damage, this))
	}
}
