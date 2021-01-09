import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellFlamingSpark from './SpellFlamingSpark'
import SpellFlameweave from './SpellFlameweave'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { getLeaderTextVariables } from '@src/utils/Utils'

export default class LeaderVelRaminea extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			sortPriority: 1,
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
			deckAddedCards: [SpellFlamingSpark, SpellFlameweave],
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound,
			...getLeaderTextVariables(this),
		}
	}
}
