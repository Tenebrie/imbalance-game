import LeaderStatType from '../../../enums/LeaderStatType'

export default interface CardStatsMessage {
	cardId: string

	power: number
	maxPower: number
	basePower: number

	armor: number
	maxArmor: number
	baseArmor: number

	unitCost: number
	baseUnitCost: number

	spellCost: number
	baseSpellCost: number

	leaderStats: { [index in LeaderStatType]: number }
}
