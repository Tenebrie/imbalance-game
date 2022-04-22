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

export default class GwentIsengrimOutlawElf extends ServerCard {
	private exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Isengrim: Elf`,
				description: `*Create* a Silver Elf.`,
				flavor: `Before us lies Elskerdeg Pass, and beyond that, Zerrikania and Hakland. Before us lies a long and dangerous road. If we are to walk it together… let us put aside our mistrust.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards
				.filter((card) => card.isCollectible)
				.filter((card) => card.color === CardColor.SILVER)
				.filter((card) => card.type === CardType.UNIT)
				.filter((card) => card.tribes.includes(CardTribe.ELF))
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
