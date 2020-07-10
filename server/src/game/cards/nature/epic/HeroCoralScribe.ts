import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEvent from '../../../models/GameEvent'

export default class HeroCoralScribe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NATURE)
		this.basePower = 7

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const stormsPlayed = this.owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).map(card => card.class)
		const uniqueStorms = [...new Set(stormsPlayed)]

		uniqueStorms.forEach(stormClass => {
			this.owner.createCardFromLibraryByClass(stormClass)
		})
	}
}
