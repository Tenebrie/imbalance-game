import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import SpellEnchantedStorm from '../tokens/SpellEnchantedStorm'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitMerfolkEnchantress extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NATURE)
		this.basePower = 4
		this.baseTribes = [CardTribe.MERFOLK]
		this.sortPriority = 1

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.owner.createCardFromLibraryByPrototype(SpellEnchantedStorm)
	}
}
