import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitUrbanTactician extends ServerCard {
	bonusPower = asSplashBuffPotency(4)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: [CardTribe.NOBLE, CardTribe.SOLDIER],
			faction: CardFaction.HUMAN,
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.requireTarget(({ target }) => !target.tribes.includes(CardTribe.BUILDING))
			.requireTarget(({ target }) => {
				const adjacentUnits = this.game.board.getAdjacentUnits(target.unit)
				return !!adjacentUnits.find((unit) => unit.card.tribes.includes(CardTribe.BUILDING))
			})
			.provide(BuffStrength, this.bonusPower)
	}
}
