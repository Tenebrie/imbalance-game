import CardStats from '../../CardStats'
import CardStatsMessage from './CardStatsMessage'

export default class HiddenCardStatsMessage implements CardStatsMessage {
	cardId: string

	power = 0
	maxPower = 0
	basePower = 0

	armor = 0
	maxArmor = 0
	baseArmor = 0

	unitCost = 0
	baseUnitCost = 0

	spellCost = 0
	baseSpellCost = 0

	directUnitDamage = 0
	splashUnitDamage = 0
	directSpellDamage = 0
	splashSpellDamage = 0
	directHealingPotency = 0
	splashHealingPotency = 0
	directBuffPotency = 0
	splashBuffPotency = 0
	directEffectDuration = 0
	splashEffectDuration = 0
	directTargetCount = 0
	criticalDamageChance = 0
	criticalBuffChance = 0
	criticalHealChance = 0

	constructor(stats: CardStats) {
		this.cardId = stats.card.id
	}
}
