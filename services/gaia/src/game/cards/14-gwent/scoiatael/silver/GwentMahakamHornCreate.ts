import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { shuffle } from '@shared/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamHornCreate extends ServerCard {
	exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Dwarven Call to Arms',
				description: '*Create* a Bronze or Silver Dwarf',
				flavor: 'This call can be heards from miles away.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card.isCollectible)
				.filter((card) => card.color === CardColor.SILVER || card.color === CardColor.BRONZE)
				.filter((card) => card.tribes.includes(CardTribe.DWARF))
				.slice()

			this.exploredCards = shuffle(validCards).slice(0, Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.exploredCards.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
				this.exploredCards = []
			})
	}
}
