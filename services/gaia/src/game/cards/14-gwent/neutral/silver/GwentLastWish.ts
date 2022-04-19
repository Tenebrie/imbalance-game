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

export default class GwentLastWish extends ServerCard {
	public static readonly CARDS_TO_LOOK = 2

	private cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.SPELL],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			cardsToLook: GwentLastWish.CARDS_TO_LOOK,
		}

		this.createLocalization({
			en: {
				name: 'The Last Wish',
				description: 'Look at {cardsToLook} random cards in your deck, then play one.',
				flavor: 'A djinn, good sirs, fulfills but three wishes. Thus freed, it flees to dimensions unknown.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const goldenCards = owner.cardDeck.allCards
			this.cardsToChoose = getMultipleRandomArrayValues(goldenCards, GwentLastWish.CARDS_TO_LOOK)
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeckOrGraveyard(targetCard)
			})
	}
}
