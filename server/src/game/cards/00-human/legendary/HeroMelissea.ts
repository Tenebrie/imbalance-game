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
import { asDirectHealingPotency, asRecurringBuffPotency } from '@src/utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '@src/game/buffs/BuffStrength'

export default class HeroMelissea extends ServerCard {
	healing = asDirectHealingPotency(3)
	extraPower = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: this.healing,
			extraPower: this.extraPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.label('card.unitPriestessOfAedine.heal.target')
			.require((args) => args.targetCard.stats.power < args.targetCard.stats.maxPower)
			.evaluate((args) => args.targetCard.stats.maxPower - args.targetCard.stats.power)
			.perform(({ targetUnit }) => onTargetSelected(targetUnit))

		const onTargetSelected = (target: ServerUnit): void => {
			target.heal(ServerDamageInstance.fromCard(this.healing, this))
		}

		this.createCallback(GameEventType.CARD_POWER_RESTORED, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard.owner === this.owner)
			.perform(({ triggeringCard }) => triggeringCard.buffs.addMultiple(BuffStrength, this.extraPower, this))
	}
}
