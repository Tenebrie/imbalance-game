import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import { AnyCardLocation, getLeaderTextVariables } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SpellBecomeTheSalvage from './SpellBecomeTheSalvage'
import SpellDiveTheSalvage from './SpellDiveTheSalvage'
import SpellPokeTheSalvage from './SpellPokeTheSalvage'
import SpellScourTheSalvage from './SpellScourTheSalvage'

export default class LeaderTheScavenger extends ServerCard {
	manaPerRound = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellPokeTheSalvage, SpellScourTheSalvage, SpellDiveTheSalvage, SpellBecomeTheSalvage],
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound,
			...getLeaderTextVariables(this),
		}
		this.addRelatedCards().requireTribe(CardTribe.SALVAGE)

		this.createCallback(GameEventType.ROUND_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => this.ownerPlayer.addSpellMana(this.manaPerRound, this))

		this.createCallback(GameEventType.GAME_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const cardsToAdd = CardLibrary.cards.filter((card) => card.tribes.includes(CardTribe.SALVAGE))
				cardsToAdd.forEach((card) => this.ownerPlayer.cardGraveyard.addSpell(CardLibrary.instantiateFromInstance(this.game, card)))
			})
	}
}
