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

export default class GwentFoglet extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.NECROPHAGE],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Foglet',
				description: 'Whenever you apply *Impenetrable Fog* to an enemy row, *Summon* a copy of this unit to the opposite row.',
				flavor: 'Fog creeps on little cat feet. Foglets creep over the bodies of their victims.',
			},
		})

		this.createCallback(GameEventType.ROW_BUFF_CREATED, [CardLocation.DECK])
			.require(({ triggeringBuff }) => triggeringBuff.parent.owner !== null)
			.require(({ triggeringBuff }) => !triggeringBuff.parent.owner!.owns(this))
			.require(() => {
				const cardsInDeck = this.ownerPlayer.cardDeck.allCards
				const cardsOfType = cardsInDeck.filter((card) => card.class === this.class)
				return this === cardsOfType[0]
			})
			.perform(({ triggeringBuff }) => {
				const oppositeRow = game.board.getOppositeRow(triggeringBuff.parent)
				if (oppositeRow.isFull()) {
					return
				}
				Keywords.summonUnitFromDeck({
					card: this,
					owner: this.ownerPlayer,
					rowIndex: oppositeRow.index,
					unitIndex: oppositeRow.cards.length,
				})
			})
	}
}
