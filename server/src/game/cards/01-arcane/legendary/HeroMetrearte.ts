import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroMetrearte extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.addRelatedCards().requireColor(CardColor.LEADER).requireFaction(CardFaction.ARCANE)

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard.faction === CardFaction.ARCANE)
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.HERO_POWER))
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		const cardCopy = CardLibrary.instantiateFromClass(this.game, target.class)
		this.ownerPlayerInGame.cardHand.addSpell(cardCopy)
	}
}
