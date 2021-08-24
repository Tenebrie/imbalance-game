import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import UnitEleyasDoppelganger from './UnitEleyasDoppelganger'

export default class HeroNotEleyas extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 30,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createEffect(GameEventType.CARD_DRAWN).perform(() => this.buffs.addMultiple(BuffStrength, 3, this))
		this.createEffect(GameEventType.CARD_RETURNED).perform(() => this.buffs.addMultiple(BuffStrength, 3, this))

		this.createSelector()
			.requireTarget(({ target }) => target instanceof UnitEleyasDoppelganger)
			.provide(BuffStrength, () => this.stats.power - this.stats.basePower)
	}
}
