import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import SpellTacticalRetreat from '@src/game/cards/00-human/leaders/Maximilian/SpellTacticalRetreat'
import { AnyCardLocation, getLeaderTextVariables } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SpellQuickStrike from './SpellQuickStrike'
import SpellReinforcements from './SpellReinforcements'
import SpellTacticalAdvance from './SpellTacticalAdvance'

export default class LeaderMaximilian extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.HUMAN,
			stats: {
				power: 10,
			},
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellQuickStrike, SpellTacticalAdvance, SpellTacticalRetreat, SpellReinforcements],
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound,
			...getLeaderTextVariables(this),
		}
		this.createCallback(GameEventType.ROUND_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => this.ownerPlayer.addSpellMana(this.manaPerRound, this))
	}
}
