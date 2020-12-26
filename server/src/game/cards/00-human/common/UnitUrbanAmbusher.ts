import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '../../../../utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitUrbanAmbusher extends ServerCard {
	bonusPower = asDirectBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				power: 5,
				armor: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.features.includes(CardFeature.BUILDING))
			.requireTarget(({ target }) => target.unit!.rowIndex === this.unit!.rowIndex)
			.provideSelf(BuffStrength, this.bonusPower)
	}
}
