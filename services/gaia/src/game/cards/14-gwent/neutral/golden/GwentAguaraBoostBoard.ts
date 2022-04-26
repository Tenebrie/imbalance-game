import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getLowestUnit } from '@src/utils/Utils'

import GwentAguara from './GwentAguara'

export default class GwentAguaraBoostBoard extends ServerCard {
	public static readonly BOOST = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Aguara's Embrace`,
				description: `Boost the *Lowest* ally by *${GwentAguaraBoostBoard.BOOST}*.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const validUnits = game.board.getSplashableUnitsFor(this).filter((unit) => !(unit.card instanceof GwentAguara))
			const target = getLowestUnit(validUnits)
			if (!target) {
				return
			}
			target.boostBy(GwentAguaraBoostBoard.BOOST, this)
		})
	}
}
