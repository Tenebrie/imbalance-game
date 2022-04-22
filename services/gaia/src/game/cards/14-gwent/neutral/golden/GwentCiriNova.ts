import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { AnyCardLocation } from '@src/utils/Utils'

export default class GwentCiriNova extends ServerCard {
	public static readonly REQ_COPIES = 2
	public static readonly OWN_POWER = 22

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CINTRA, CardTribe.WITCHER, CardTribe.DOOMED],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ciri: Nova`,
				description: `If you have exactly *${GwentCiriNova.REQ_COPIES}* copies of each Bronze card in your starting deck, set base power to *${GwentCiriNova.OWN_POWER}*.`,
				flavor: `Zireael possesses a great power she cannot control. She is a danger - to herself, to others. Until she learns to control it, she should remain isolated.`,
			},
		})

		this.createCallback(GameEventType.GAME_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.require(() => {
				const owner = this.ownerPlayer
				const getCardCount = (cardClass: string): number => {
					return owner.startingDeck.unitCards.filter((card) => card.class === cardClass).length
				}
				const allBronzeCards = owner.startingDeck.unitCards
					.filter((card) => card.color === CardColor.BRONZE)
					.map((card) => ({
						card,
						count: getCardCount(card.class),
					}))

				return allBronzeCards.every((card) => card.count === GwentCiriNova.REQ_COPIES)
			})
			.perform(() => {
				this.strengthen(GwentCiriNova.OWN_POWER - this.stats.basePower, this, 'stagger', 'merge')
			})
	}
}
