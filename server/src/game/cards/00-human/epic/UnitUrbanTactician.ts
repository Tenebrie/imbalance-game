import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashBuffPotency } from '../../../../utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitUrbanTactician extends ServerCard {
	bonusPower = asSplashBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: [CardTribe.NOBLE],
			faction: CardFaction.HUMAN,
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target !== this)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.requireTarget(({ target }) => !target.features.includes(CardFeature.BUILDING))
			.requireTarget(({ target }) => {
				const adjacentUnits = this.game.board.getAdjacentUnits(target.unit)
				return !!adjacentUnits.find((unit) => unit.card.features.includes(CardFeature.BUILDING))
			})
			.provide(BuffStrength, this.bonusPower)
	}
}
