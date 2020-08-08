import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import SpellHealingRain from '../tokens/SpellHealingRain'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroTribeShaman extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NATURE)
		this.basePower = 6
		this.baseTribes = [CardTribe.MERFOLK]
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.owner.createCardFromLibraryByPrototype(SpellHealingRain)
	}
}
