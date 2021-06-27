import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellSteelSpark from './SpellSteelSpark'
import SpellFireball from './SpellFireball'
import SpellAnEncouragement from './SpellAnEncouragement'
import ExpansionSet from '@shared/enums/ExpansionSet'
import SpellEternalServitude from './SpellEternalServitude'
import { AnyCardLocation, getLeaderTextVariables } from '@src/utils/Utils'
import GameEventType from '@src/../../shared/src/enums/GameEventType'

export default class LeaderVelElleron extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			stats: {
				power: 10,
			},
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellEternalServitude],
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound,
			...getLeaderTextVariables(this),
		}
		this.createCallback(GameEventType.ROUND_STARTED, AnyCardLocation)
			.require(({ player }) => player === this.ownerInGame)
			.perform(({ player }) => player.addSpellMana(this.manaPerRound))
	}
}
