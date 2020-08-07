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
import CardFeature from '@shared/enums/CardFeature'

export default class HeroLightOracle extends ServerCard {
	cardsToSee = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 4
		this.sortPriority = 1
		this.baseFeatures = [CardFeature.KEYWORD_SUMMON]
		this.dynamicTextVariables = {
			cardsToSee: this.cardsToSee
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_UNIT_DECK)
			.inPlayersDeck()
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.deckPosition < this.cardsToSee))
	}

	private onTargetSelected(target: ServerCard): void {
		this.owner.summonCardFromUnitDeck(target)
	}
}
