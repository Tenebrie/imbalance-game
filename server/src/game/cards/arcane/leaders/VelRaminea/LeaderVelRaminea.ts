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
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.EXPERIMENTAL,
			sortPriority: 1,
			isExperimental: true
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}

	getDeckAddedSpellCards(): any[] {
		return [SpellFlamingSpark, SpellFlameweave]
	}
}
