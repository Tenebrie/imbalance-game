import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentHarpy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Harpy',
				description: 'Whenever you destroy an allied Beast, *Summon* a copy of this unit to the same position.',
				flavor: 'There are many species of harpy, and all are kleptomaniacs.',
			},
		})

		this.createCallback(GameEventType.AFTER_UNIT_DESTROYED, [CardLocation.DECK])
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.BEAST))
			.require(() => {
				const cardsInDeck = this.ownerPlayer.cardDeck.allCards
				const cardsOfType = cardsInDeck.filter((card) => card.class === this.class)
				return this === cardsOfType[0]
			})
			.requireImmediate(({ rowIndex }) => !game.board.rows[rowIndex].isFull())
			.perform(({ rowIndex, unitIndex }) => {
				Keywords.summonUnitFromDeck({
					card: this,
					owner: this.ownerPlayer,
					rowIndex,
					unitIndex,
				})
			})
	}
}
