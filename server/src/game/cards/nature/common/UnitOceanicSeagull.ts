import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitOceanicSeagull extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NATURE)
		this.basePower = 2
		this.baseTribes = [CardTribe.BIRD]
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_UNIT_DECK)
			.inPlayersDeck()
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.color === CardColor.BRONZE))
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.tribes.includes(CardTribe.MERFOLK)))
	}

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void {
		thisUnit.owner.summonCardFromUnitDeck(target)
	}
}
