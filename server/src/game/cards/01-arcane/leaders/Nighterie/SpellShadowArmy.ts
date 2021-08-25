import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../../models/ServerUnit'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../../utils/Keywords'

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
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_CREATE],
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

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(() => this.allowedTargets)
			.requireAllied()
			.label('card.spellShadowArmy.target')
			.require((args) => !this.copiedUnits.includes(args.targetCard.unit!))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.resetState())

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
