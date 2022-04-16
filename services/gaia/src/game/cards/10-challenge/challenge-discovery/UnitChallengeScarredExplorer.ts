import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { shuffle } from '@src/utils/Utils'

import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'

export default class UnitChallengeScarredExplorer extends ServerCard {
	exploredCards: ServerCard[] = []
	cardsToExplore = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			cardsToExplore: this.cardsToExplore,
		}

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => this.onDeploy())

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require((args) => args.targetCard.color === CardColor.SILVER)
			.require(({ targetCard }) => this.exploredCards.includes(targetCard))
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onDeploy(): void {
		const epicCards = CardLibrary.cards
			.filter((card) => card.color === CardColor.SILVER)
			.filter((card) => card.isCollectible)
			.slice()
		this.exploredCards = shuffle(epicCards).slice(0, this.cardsToExplore)
	}

	private onTargetSelected(target: ServerCard): void {
		Keywords.createCard.for(this.ownerPlayer).fromInstance(target)
		this.exploredCards = []
	}
}
