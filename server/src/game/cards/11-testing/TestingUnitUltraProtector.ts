import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import GameHookType from '../../models/events/GameHookType'
import CardLocation from '@shared/enums/CardLocation'

export default class TestingUnitUltraProtector extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: false,
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(({ targetCard }) => targetCard !== this)
			.replace((values) => ({
				...values,
				targetCard: this,
			}))
	}
}
