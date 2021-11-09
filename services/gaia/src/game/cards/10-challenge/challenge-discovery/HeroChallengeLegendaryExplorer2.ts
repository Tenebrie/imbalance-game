import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { shuffle } from '@src/utils/Utils'

import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroChallengeLegendaryExplorer2 extends ServerCard {
	exploredCards: ServerCard[] = []
	cardsToExplore = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			cardsToExplore: this.cardsToExplore,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require((args) => args.targetCard.color === CardColor.GOLDEN)
			.require(({ targetCard }) => this.exploredCards.includes(targetCard))
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onDeploy(): void {
		const legendaryCards = CardLibrary.cards
			.filter((card) => card.color === CardColor.GOLDEN)
			.filter((card) => card.isCollectible)
			.slice()
		this.exploredCards = shuffle(legendaryCards).slice(0, this.cardsToExplore)
	}

	private onTargetSelected(target: ServerCard): void {
		Keywords.createCard.for(this.ownerPlayer).fromInstance(target)
		this.exploredCards = []
	}
}
