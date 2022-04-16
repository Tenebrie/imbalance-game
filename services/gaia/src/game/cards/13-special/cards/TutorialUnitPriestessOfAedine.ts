import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitPriestessOfAedine from '@src/game/cards/00-human/common/UnitPriestessOfAedine'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

import { DamageInstance } from '../../../models/ServerDamageSource'
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
			stats: {
				power: 15,
			},
			sharedArtwork: UnitPriestessOfAedine,
			expansionSet: ExpansionSet.TUTORIAL,
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
		target.heal(DamageInstance.fromUnit(this.healing, this.unit!))
	}
}
