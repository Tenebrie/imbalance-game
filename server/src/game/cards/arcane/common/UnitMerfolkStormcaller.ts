import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import SpellGatheringStorm from '../tokens/SpellGatheringStorm'
import GameEvent from '../../../models/GameEvent'

export default class UnitMerfolkStormcaller extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 4

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.owner.createCardFromLibraryByPrototype(SpellGatheringStorm)
	}
}
