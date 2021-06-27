import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { AnyCardLocation, getLeaderTextVariables } from '@src/utils/Utils'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import SpellPokeTheSalvage from './SpellPokeTheSalvage'
import SpellDiveTheSalvage from './SpellDiveTheSalvage'
import SpellScourTheSalvage from './SpellScourTheSalvage'
import SpellBecomeTheSalvage from './SpellBecomeTheSalvage'

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
			.require(({ player }) => player === this.ownerInGame)
			.perform(({ player }) => player.addSpellMana(this.manaPerRound))

		this.createCallback(GameEventType.GAME_STARTED, AnyCardLocation)
			.require(({ player }) => player === this.ownerInGame)
			.perform(() => {
				const cardsToAdd = CardLibrary.cards.filter((card) => card.tribes.includes(CardTribe.SALVAGE))
				cardsToAdd.forEach((card) => this.ownerInGame.cardGraveyard.addSpell(CardLibrary.instantiateFromInstance(this.game, card)))
			})
	}
}
