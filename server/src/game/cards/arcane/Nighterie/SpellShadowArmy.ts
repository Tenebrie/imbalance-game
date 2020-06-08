import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'

export default class SpellShadowArmy extends ServerCard {
	powerThreshold = 3
	thresholdDecrease = 1
	allowedTargets = 1
	copiedUnits: ServerUnit[] = []

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 12
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			powerThreshold: () => this.powerThreshold,
			showPowerThreshold: () => this.powerThreshold > 0,
			thresholdDecrease: this.thresholdDecrease
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.require(TargetType.UNIT, this.allowedTargets)
			.alliedUnit()
			.label(TargetType.UNIT, 'card.target.spellShadowArmy')
			.validate(TargetType.UNIT, args => !this.copiedUnits.includes(args.targetUnit))
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		if (target.card.basePower <= this.powerThreshold) {
			this.powerThreshold -= this.thresholdDecrease
			this.allowedTargets += 1
		}

		owner.createCardFromLibraryByInstance(target.card)
		this.copiedUnits.push(target)
	}
}
