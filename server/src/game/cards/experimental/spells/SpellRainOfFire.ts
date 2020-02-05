import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/CardPlayTargetDefinitionBuilder'
import TargetType from '../../../shared/enums/TargetType'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'

export default class SpellRainOfFire extends ServerCard {
	damage = 12
	targets = 5

	constructor(game: ServerGame) {
		super(game, CardType.SPELL)
		this.cardTextVariables = {
			damage: this.damage,
			targets: this.targets
		}
	}

	definePlayRequiredTargets(): TargetDefinitionBuilder {
		return CardPlayTargetDefinitionBuilder.base(this.game)
			.enemyUnit()
			.unique(TargetType.UNIT)
			.multiTarget(this.targets)
			.allow(TargetType.UNIT, this.targets)
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerCardOnBoard): void {
		target.dealDamage(ServerDamageInstance.fromSpell(this.damage, this))
	}

	onSpellPlayTargetsConfirmed(owner: ServerPlayerInGame): void {
		owner.drawCards(1)
	}
}
