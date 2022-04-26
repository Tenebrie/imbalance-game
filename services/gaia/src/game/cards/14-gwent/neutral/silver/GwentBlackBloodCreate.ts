import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import { GwentBlackBlood } from './GwentBlackBlood'

export default class GwentBlackBloodCreate extends ServerCard {
	public static readonly EXTRA_POWER = 2

	private cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM, CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBlackBlood],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Summoning Blood`,
				description: `*Create* a Bronze Necrophage or Vampire and boost it by *${GwentBlackBloodCreate.EXTRA_POWER}*.`,
				flavor: `...however, some ways to use it are not as bad as the others.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card.isCollectible)
				.filter((card) => card.color === CardColor.BRONZE)
				.filter((card) => card.tribes.includes(CardTribe.VAMPIRE) || card.tribes.includes(CardTribe.NECROPHAGE))
				.slice()
			this.cardsToChoose = getMultipleRandomArrayValues(validCards, Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
				this.cardsToChoose = []
			})
	}
}
