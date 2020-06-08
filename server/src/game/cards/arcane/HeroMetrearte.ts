import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../models/ServerUnit'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../libraries/CardLibrary'

export default class HeroMetrearte extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 5
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_LIBRARY)
			.validate(TargetType.CARD_IN_LIBRARY, (args => args.targetCard.features.includes(CardFeature.HERO_POWER) && args.targetCard.faction === CardFaction.ARCANE))
	}

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void {
		const cardCopy = CardLibrary.instantiateByClass(this.game, target.class)
		thisUnit.owner.cardHand.addSpell(cardCopy)
	}
}
