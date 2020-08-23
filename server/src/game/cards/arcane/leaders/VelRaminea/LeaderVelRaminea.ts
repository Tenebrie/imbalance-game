import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellFlamingSpark from './SpellFlamingSpark'
import SpellFlameweave from './SpellFlameweave'

export default class LeaderVelRaminea extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.LEADER, CardFaction.EXPERIMENTAL)
		this.basePower = 0
		this.sortPriority = 1
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}

	getDeckAddedSpellCards(): any[] {
		return [SpellFlamingSpark, SpellFlameweave]
	}
}
