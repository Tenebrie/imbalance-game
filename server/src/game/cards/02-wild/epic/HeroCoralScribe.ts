import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class HeroCoralScribe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.WILD,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			generatedArtworkMagicString: '2',
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy() {
		const owner = this.ownerInGame
		const stormsPlayed = owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).map((card) => card.class)
		const uniqueStorms = [...new Set(stormsPlayed)]

		uniqueStorms.forEach((stormClass) => {
			Keywords.createCard.forOwnerOf(this).fromClass(stormClass)
		})
	}
}
