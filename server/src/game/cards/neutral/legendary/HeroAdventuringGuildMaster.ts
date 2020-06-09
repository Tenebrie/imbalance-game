import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardFaction from '@shared/enums/CardFaction'
import ServerBoardRow from '../../../models/ServerBoardRow'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'

export default class HeroAdventuringGuildMaster extends ServerCard {
	powerPerCard = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NEUTRAL)
		this.basePower = 10
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard
		}
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		const otherCardsPlayed = thisUnit.owner.cardsPlayed.filter(card => card !== this && card.type === CardType.UNIT)
		for (let i = 0; i < otherCardsPlayed.length * this.powerPerCard; i++) {
			thisUnit.buffs.add(new BuffStrength(), this, BuffDuration.INFINITY)
		}
	}
}
