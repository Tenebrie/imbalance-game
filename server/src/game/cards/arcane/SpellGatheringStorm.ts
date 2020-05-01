import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../models/ServerUnit'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'

export default class SpellGatheringStorm extends ServerCard {
	damage = 1
	baseTargets = 2
	targetsPerStorm = 2
	targetsHit = []

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.BRONZE, CardFaction.ARCANE)

		this.basePower = 3
		this.dynamicTextVariables = {
			damage: this.damage,
			targetCount: () => this.targetCount,
			targetsPerStorm: this.targetsPerStorm
		}
	}

	get targetCount() {
		let stormsPlayed = 0
		if (this.owner) {
			stormsPlayed = this.owner.cardGraveyard.findCardsByConstructor(SpellGatheringStorm).length
		}

		return this.baseTargets + this.targetsPerStorm * stormsPlayed
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.multipleTargets(this.targetCount)
			.allow(TargetType.UNIT, this.targetCount)
			.enemyUnit()
			.validate(TargetType.UNIT, args => !this.targetsHit.includes(args.targetUnit))
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromSpell(this.damage, this))
		this.targetsHit.push(target)
	}

	onUnitPlayTargetsConfirmed(thisUnit: ServerUnit): void {
		this.targetsHit = []
	}
}
