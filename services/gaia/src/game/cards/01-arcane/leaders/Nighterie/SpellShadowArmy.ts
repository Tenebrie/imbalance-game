import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../../utils/Keywords'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellShadowArmy extends ServerCard {
	powerThreshold = 3
	thresholdDecrease = 3
	allowedTargets = 1
	copiedUnits: ServerUnit[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerThreshold: () => this.powerThreshold,
			showPowerThreshold: () => this.powerThreshold > 0,
			thresholdDecrease: this.thresholdDecrease,
		}

		this.createLocalization({
			en: {
				name: 'Army of Shadows',
				description:
					'*Create* a copy of an allied unit.\n<if showPowerThreshold>If it has {powerThreshold} Power or less, repeat this effect.<p><i>This value decreases by {thresholdDecrease} after every copy.</i></if>',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(() => this.allowedTargets)
			.requireAllied()
			.label('card.spellShadowArmy.target')
			.require((args) => !this.copiedUnits.includes(args.targetCard.unit!))
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
			.finalize(() => this.resetState())

		this.resetState()
	}

	private resetState(): void {
		this.powerThreshold = 3
		this.copiedUnits = []
	}

	private onTargetSelected(target: ServerUnit): void {
		if (target.card.stats.basePower <= this.powerThreshold && this.powerThreshold > 0) {
			this.powerThreshold -= this.thresholdDecrease
			this.allowedTargets += 1
		}

		this.copiedUnits.push(target)
		Keywords.createCard.forOwnerOf(this).fromInstance(target.card)
	}
}
