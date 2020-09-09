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
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitOceanicSeagull extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BIRD],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_SUMMON],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.MERFOLK).requireColor(CardColor.BRONZE)

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_UNIT_DECK)
			.requireCardInPlayersDeck()
			.require(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.color === CardColor.BRONZE))
			.require(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.tribes.includes(CardTribe.MERFOLK)))

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		this.owner.summonCardFromUnitDeck(target)
	}
}
