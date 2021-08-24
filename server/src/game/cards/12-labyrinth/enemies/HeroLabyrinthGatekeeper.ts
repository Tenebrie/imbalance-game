import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroLabyrinthGatekeeper extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 30,
				armor: 10,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.createLocalization({
			en: {
				name: 'The Gatekeeper',
				title: 'Guardian of the Labyrinth',
				description: '<i>???</i>',
			},
		})
	}
}
