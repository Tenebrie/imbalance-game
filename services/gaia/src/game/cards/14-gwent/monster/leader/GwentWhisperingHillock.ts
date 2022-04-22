import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import Keywords from '@src/utils/Keywords'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentWhisperingHillock extends ServerCard {
	exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.addRelatedCards().requireTribe(CardTribe.ORGANIC).requireAnyColor([CardColor.BRONZE, CardColor.SILVER]).requireCollectible()

		this.createLeaderLocalization({
			en: {
				name: 'Whispering Hillock',
				description: '*Create* a Bronze or Silver Organic card.',
				flavor: 'That is not dead which can eternal lie, and with strange aeons even death may die.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card.isCollectible)
				.filter((card) => card.color === CardColor.SILVER || card.color === CardColor.BRONZE)
				.filter((card) => card.tribes.includes(CardTribe.ORGANIC))
				.slice()
			this.exploredCards = getMultipleRandomArrayValues(validCards, Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => getCreate)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
				this.exploredCards = []
			})
	}
}
