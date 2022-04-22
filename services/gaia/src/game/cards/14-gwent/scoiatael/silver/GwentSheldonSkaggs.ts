import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentSheldonSkaggs extends ServerCard {
	protected static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF, CardTribe.OFFICER],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentSheldonSkaggs.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Sheldon Skaggs',
				description: 'Move all allies on this row to random rows and boost self by {boost} for each.',
				flavor: "I was there, on the front lines! Right where the fightin' was the thickest!",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			triggeringUnit.boardRow.splashableCards
				.filter((unit) => unit !== triggeringUnit)
				.forEach((unit) => {
					const otherRows = game.board.rows
						.filter((row) => row.owner?.owns(this))
						.filter((row) => row.index !== unit.boardRow.index)
						.filter((row) => row.isNotFull)
					const rowToMove = getRandomArrayValue(otherRows)
					Keywords.moveUnit(unit, rowToMove, rowToMove.farRightUnitIndex)
					this.buffs.addMultiple(BuffStrength, GwentSheldonSkaggs.BOOST, this)
				})
		})
	}
}
