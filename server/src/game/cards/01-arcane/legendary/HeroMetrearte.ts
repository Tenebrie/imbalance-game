import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroMetrearte extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, (args => args.targetCard.features.includes(CardFeature.HERO_POWER) && args.targetCard.faction === CardFaction.ARCANE))

		this.addRelatedCards()
			.requireColor(CardColor.LEADER)
			.requireFaction(CardFaction.ARCANE)

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		const cardCopy = CardLibrary.instantiateByClass(this.game, target.class)
		this.unit.owner.cardHand.addSpell(cardCopy)
	}
}
