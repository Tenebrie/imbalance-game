import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../../models/ServerUnit'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellShadowArmy extends ServerCard {
	powerThreshold = 3
	thresholdDecrease = 1
	allowedTargets = 1
	copiedUnits: ServerUnit[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_CREATE],
			stats: {
				cost: 12
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerThreshold: () => this.powerThreshold,
			showPowerThreshold: () => this.powerThreshold > 0,
			thresholdDecrease: this.thresholdDecrease
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.require(TargetType.UNIT, this.allowedTargets)
			.alliedUnit()
			.label(TargetType.UNIT, 'card.spellShadowArmy.target')
			.validate(TargetType.UNIT, args => !this.copiedUnits.includes(args.targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		if (target.card.stats.basePower <= this.powerThreshold && this.powerThreshold > 0) {
			this.powerThreshold -= this.thresholdDecrease
			this.allowedTargets += 1
		}

		this.owner.createCardFromLibraryByInstance(target.card)
		this.copiedUnits.push(target)
	}
}
