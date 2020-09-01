import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroCoralScribe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NATURE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			generatedArtworkMagicString: '2',
			stats: {
				power: 7,
			}
		})
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.UNIT_DEPLOYED)
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
