import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'
import Utils from '../../../../utils/Utils'

export default class HeroChallengeLegendaryExplorer1 extends ServerCard {
	exploredCards: ServerCard[] = []
	cardsToExplore = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			cardsToExplore: this.cardsToExplore,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, (args) => args.targetCard.color === CardColor.GOLDEN)
			.require(TargetType.CARD_IN_LIBRARY, ({ targetCard }) => this.exploredCards.includes(targetCard))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onDeploy(): void {
		const legendaryCards = CardLibrary.cards
			.filter((card) => card.color === CardColor.GOLDEN)
			.filter((card) => card.isCollectible && !card.isExperimental)
			.slice()
		this.exploredCards = Utils.shuffle(legendaryCards).slice(0, this.cardsToExplore)
	}

	private onTargetSelected(target: ServerCard): void {
		Keywords.createCard.for(this.ownerInGame).fromInstance(target)
		this.exploredCards = []
	}
}
