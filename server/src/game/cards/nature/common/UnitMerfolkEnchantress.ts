import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import SpellEnchantedStorm from '../tokens/SpellEnchantedStorm'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import {mapRelatedCards} from '../../../../utils/Utils'

export default class UnitMerfolkEnchantress extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NATURE)
		this.basePower = 4
		this.baseTribes = [CardTribe.MERFOLK]
		this.sortPriority = 1
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE]
		this.baseRelatedCards = [SpellEnchantedStorm]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.owner.createCardFromLibraryByPrototype(SpellEnchantedStorm)
	}
}
