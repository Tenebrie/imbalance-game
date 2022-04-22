import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getAllLowestUnits } from '@src/utils/Utils'

export default class GwentTrissButterflies extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.TEMERIA],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Triss: Butterflies`,
				description: `Boost the *Lowest* allies by *${GwentTrissButterflies.BOOST}* on turn end.`,
				flavor: `Cap'n… our arrows, they've… they've got wings!`,
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(({ group }) => {
				const alliedUnits = game.board.getSplashableUnitsFor(group).filter((unit) => unit.card !== this)
				const targets = getAllLowestUnits(alliedUnits)
				targets.forEach((target) => {
					target.boost(GwentTrissButterflies.BOOST, this, 'stagger')
				})
			})
	}
}
