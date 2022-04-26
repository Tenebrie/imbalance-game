import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentElvenMercenary extends ServerCard {
	public static readonly CARDS_TO_LOOK = 2

	cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Elven Mercenary`,
				description: `Look at *${GwentElvenMercenary.CARDS_TO_LOOK}* random Bronze special cards from your deck, then play one.`,
				flavor: `I spit on Scoia'tael ideals, but not on their coin.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const bronzeSpecialCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.SPELL && card.color === CardColor.BRONZE)
			this.cardsToChoose = getMultipleRandomArrayValues(bronzeSpecialCards, GwentElvenMercenary.CARDS_TO_LOOK)
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
