import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { asDirectHealingPotency, asRecurringBuffPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class HeroMelissea extends ServerCard {
	healing = asDirectHealingPotency(6)
	extraPower = asRecurringBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 22,
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
			target.heal(DamageInstance.fromCard(this.healing, this))
		}

		this.createCallback(GameEventType.CARD_POWER_RESTORED, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard.ownerPlayerNullable === this.ownerPlayerNullable)
			.perform(({ triggeringCard }) => triggeringCard.buffs.addMultiple(BuffStrength, this.extraPower, this))
	}
}
