import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import SpellReinforcements from './SpellReinforcements'
import SpellQuickStrike from './SpellQuickStrike'
import SpellTacticalMove from './SpellTacticalMove'

export default class LeaderMaximilian extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellQuickStrike, SpellTacticalMove, SpellTacticalMove, SpellReinforcements]
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}
}
