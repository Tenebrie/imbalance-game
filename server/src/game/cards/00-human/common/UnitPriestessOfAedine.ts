import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitPriestessOfAedine extends ServerCard {
	targets = 1
	healing = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targets: this.targets,
			healing: this.healing
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT, this.targets)
			.requireAlliedUnit()
			.requireNotSelf()
			.requireUnique(TargetType.UNIT)
			.label(TargetType.UNIT, 'card.unitPriestessOfAedine.heal.target')
			.require(TargetType.UNIT, args => args.targetCard.stats.power < args.targetCard.stats.maxPower)
			.evaluate(TargetType.UNIT, args => args.targetCard.stats.maxPower - args.targetCard.stats.power)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.heal(ServerDamageInstance.fromUnit(this.healing, this.unit!))
	}
}
