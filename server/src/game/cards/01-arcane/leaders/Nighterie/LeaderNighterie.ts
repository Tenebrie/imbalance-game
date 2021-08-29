import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation, getLeaderTextVariables } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SpellCrystalBarrage from './SpellCrystalBarrage'
import SpellNightmareDrain from './SpellNightmareDrain'
import SpellShadowArmy from './SpellShadowArmy'
import SpellShadowSpark from './SpellShadowSpark'

export default class LeaderNighterie extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			stats: {
				power: 10,
			},
			sortPriority: 2,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellShadowSpark, SpellNightmareDrain, SpellCrystalBarrage, SpellShadowArmy],
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound,
			...getLeaderTextVariables(this),
		}
		this.createCallback(GameEventType.ROUND_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => this.ownerPlayer.addSpellMana(this.manaPerRound))
	}
}
