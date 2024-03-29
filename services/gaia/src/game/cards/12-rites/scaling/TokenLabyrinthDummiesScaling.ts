import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class TokenLabyrinthDummiesScaling extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.PASSIVE],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.RITES,
		})

		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroup.owns(this))
			.provide(BuffStrength, () => 0)
	}
}
