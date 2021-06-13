import CardStats from '../../CardStats'
import CardStatsMessage from './CardStatsMessage'
import LeaderStatType from '../../../enums/LeaderStatType'
import { forEachInEnum } from '../../../Utils'

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

	leaderStats: { [index in LeaderStatType]: number }

	constructor(stats: CardStats) {
		this.cardId = stats.card.id
		this.leaderStats = {
			...stats.leaderStats,
		}
		forEachInEnum(LeaderStatType, (val) => {
			this.leaderStats[val] = 0
		})
	}
}
