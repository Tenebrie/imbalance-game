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

	soloUnitDamage = 0
	massUnitDamage = 0
	soloSpellDamage = 0
	massSpellDamage = 0
	soloHealingPotency = 0
	massHealingPotency = 0
	soloBuffPotency = 0
	massBuffPotency = 0
	soloEffectDuration = 0
	massEffectDuration = 0
	targetCount = 0
	criticalHitChance = 0
	criticalBuffChance = 0
	criticalHealChance = 0

	constructor(stats: CardStats) {
		this.cardId = stats.card.id
	}
}
