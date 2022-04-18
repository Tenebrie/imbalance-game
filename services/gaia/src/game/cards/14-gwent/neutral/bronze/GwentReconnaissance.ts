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

export default class GwentReconnaissance extends ServerCard {
	public static readonly CARDS_TO_LOOK = 2

	private cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			tribes: [CardTribe.TACTIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			cardsToLook: GwentReconnaissance.CARDS_TO_LOOK,
		}

		this.createLocalization({
			en: {
				name: 'Reconnaissance',
				description: 'Look at {cardsToLook} random Bronze units in your deck, then play one.',
				flavor:
					"If our scouts don't come back, we turn around. The yokels claim these woods are full o' squirrels - and I don't mean the nut-gatherin' kind.",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const goldenCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.UNIT && card.color === CardColor.BRONZE)
			this.cardsToChoose = getMultipleRandomArrayValues(goldenCards, GwentReconnaissance.CARDS_TO_LOOK)
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
