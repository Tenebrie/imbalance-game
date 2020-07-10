import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import CardTribe from '@shared/enums/CardTribe'
import SpellHealingRain from '../tokens/SpellHealingRain'

export default class HeroTribeShaman extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NATURE)
		this.basePower = 6
		this.baseTribes = [CardTribe.MERFOLK]

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.owner.createCardFromLibraryByPrototype(SpellHealingRain)
	}
}
