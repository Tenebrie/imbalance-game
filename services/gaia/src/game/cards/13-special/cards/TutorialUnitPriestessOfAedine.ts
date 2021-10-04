import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class TutorialUnitPriestessOfAedine extends ServerCard {
	targets = 1
	healing = asDirectHealingPotency(10)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_HEAL],
			stats: {
				power: 15,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targets: this.targets,
			healing: this.healing,
		}

		this.createLocalization({
			en: {
				name: 'Priestess of Aedine',
				description: '*Deploy:*\n*Heal* {healing} an allied unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(this.targets)
			.requireAllied()
			.requireNotSelf()
			.requireUnique()
			.label('card.unitPriestessOfAedine.heal.target')
			.require((args) => args.targetCard.stats.power < args.targetCard.stats.maxPower)
			.evaluate((args) => args.targetCard.stats.maxPower - args.targetCard.stats.power)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.heal(ServerDamageInstance.fromUnit(this.healing, this.unit!))
	}
}
