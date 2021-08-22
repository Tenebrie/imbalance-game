import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import BuffHiddenStrength from '@src/game/buffs/BuffHiddenStrength'
import CardTribe from '@shared/enums/CardTribe'

export default class TokenLabyrinthDummiesScaling extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LABYRINTH_BOOTS],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T0],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})

		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this))
			.provide(BuffHiddenStrength, () => 0)
	}
}
