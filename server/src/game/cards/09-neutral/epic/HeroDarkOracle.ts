import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroDarkOracle extends ServerCard {
	cardsToSee = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_DISCARD],
			sortPriority: 2,
			generatedArtworkMagicString: '2',
			stats: {
				power: 4
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			cardsToSee: this.cardsToSee
		}

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_UNIT_DECK)
			.requireCardInOpponentsDeck()
			.require(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition < this.cardsToSee))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		target.ownerInGame.cardDeck.discardUnit(target)
	}
}
