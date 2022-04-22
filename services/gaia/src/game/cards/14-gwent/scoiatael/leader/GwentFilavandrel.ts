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
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentFilavandrel extends ServerCard {
	private exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF],
			stats: {
				power: 4,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLeaderLocalization({
			en: {
				name: `Filavandrel`,
				description: `*Create* a Silver special card.`,
				flavor: `Though we are now few and scattered, our hearts burn brighter than ever.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card.isCollectible)
				.filter((card) => card.color === CardColor.SILVER)
				.filter((card) => card.type === CardType.SPELL)
				.filter((card) => card.faction === CardFaction.SCOIATAEL || card.faction === CardFaction.NEUTRAL)
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
