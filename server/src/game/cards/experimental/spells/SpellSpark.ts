import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '../../../shared/enums/CardColor'
import TargetMode from '../../../shared/enums/TargetMode'
import CardLibrary from '../../../libraries/CardLibrary'
import TargetType from '../../../shared/enums/TargetType'

export default class SpellSpark extends ServerCard {
	damage = 1

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN)
		this.basePower = 1
		this.cardTextVariables = {
			damage: this.damage
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerCardOnBoard): void {
		target.dealDamage(ServerDamageInstance.fromSpell(this.damage, this))
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		owner.cardHand.addSpell(CardLibrary.instantiate(new SpellSpark(this.game)))
	}
}
