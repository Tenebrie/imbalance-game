import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitRavenMessenger extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 2
		this.baseTribes = [CardTribe.BIRD]
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_SUMMON]
		this.addRelatedCards().requireTribe(CardTribe.HUMAN).requireColor(CardColor.BRONZE)

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_UNIT_DECK)
			.inPlayersDeck()
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.color === CardColor.BRONZE))
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.tribes.includes(CardTribe.HUMAN)))
	}

	private onTargetSelected(target: ServerCard): void {
		this.owner.summonCardFromUnitDeck(target)
	}
}
