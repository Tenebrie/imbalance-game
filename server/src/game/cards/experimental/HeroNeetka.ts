import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../models/ServerUnit'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'

export default class HeroNeetka extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 1
		this.baseTribes = [CardTribe.HUMAN]
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_UNIT_DECK)
			.inPlayersDeck()
			.validate(TargetType.CARD_IN_UNIT_DECK, (args => args.targetCard.color === CardColor.GOLDEN))
	}

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void {
		thisUnit.owner.summonCardFromUnitDeck(target)
	}
}
