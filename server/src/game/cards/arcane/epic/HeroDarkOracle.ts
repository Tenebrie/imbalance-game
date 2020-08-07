import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class HeroDarkOracle extends ServerCard {
	cardsToSee = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 4
		this.sortPriority = 2
		this.dynamicTextVariables = {
			cardsToSee: this.cardsToSee
		}
		this.generatedArtworkMagicString = '2'

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_UNIT_DECK)
			.inOpponentsDeck()
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition >= args.targetCard.owner.cardDeck.unitCards.length - this.cardsToSee))
	}

	private onTargetSelected(target: ServerCard): void {
		target.owner.cardDeck.discardUnit(target)
	}
}
