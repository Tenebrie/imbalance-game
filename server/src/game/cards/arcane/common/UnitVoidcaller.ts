import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import UnitVoidPortal from '../tokens/UnitVoidPortal'
import {mapRelatedCards} from '../../../../utils/Utils'

export default class UnitVoidcaller extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 6
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE]
		this.baseRelatedCards = mapRelatedCards([UnitVoidPortal])

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		this.owner.createCardFromLibraryByPrototype(UnitVoidPortal)
	}
}
