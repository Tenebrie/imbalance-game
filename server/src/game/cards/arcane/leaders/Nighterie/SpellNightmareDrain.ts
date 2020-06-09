import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerPlayerInGame from '../../../../players/ServerPlayerInGame'
import ServerUnit from '../../../../models/ServerUnit'
import ServerAnimation from '../../../../models/ServerAnimation'
import CardLibrary from '../../../../libraries/CardLibrary'
import UnitShadowspawn from '../../tokens/UnitShadowspawn'
import BuffStrength from '../../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'

export default class SpellNightmareDrain extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseFeatures = [CardFeature.HERO_POWER]
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.validate(TargetType.UNIT, args => args.targetCard.power < args.targetCard.basePower)
	}

	onPlayedAsSpell(owner: ServerPlayerInGame): void {
		if (this.game.cardPlay.getValidTargets().length > 0) {
			return
		}

		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(owner, 0)
		this.game.board.createUnit(shadowspawn, owner, targetRow.index, targetRow.cards.length)
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(owner, 0)
		const shadowspawnUnit = this.game.board.createUnit(shadowspawn, owner, targetRow.index, targetRow.cards.length)

		const missingHealth = target.card.basePower - target.card.power
		this.game.animation.play(ServerAnimation.unitAttacksUnits(target, [shadowspawnUnit]))

		if (missingHealth <= 0) {
			return
		}

		for (let i = 0; i < missingHealth; i++) {
			shadowspawnUnit.buffs.add(new BuffStrength(), shadowspawn, BuffDuration.INFINITY)
		}
	}
}
