import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentNivellen extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Nivellen`,
				description: `Move all units on a row to random rows.`,
				flavor: `Lost? Well, go be lost somewhere else. Somewhere not on my property, that is. Point your left ear to the sun and keep walking, you'll hit the road soon enough. Well? What're you waiting for?`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(({ targetRow }) => targetRow.splashableCards.length > 0)
			.perform(({ targetRow }) => {
				const targets = targetRow.splashableCards.filter((unit) => unit.card !== this)

				targets.forEach((unit) => {
					const validTargetRows = game.board
						.getControlledRows(unit.owner)
						.filter((row) => row !== unit.boardRow)
						.filter((row) => row.isNotFull())
					const targetRow = getRandomArrayValue(validTargetRows)
					if (!targetRow) {
						return
					}
					game.animation.instantThread(() => {
						Keywords.moveUnit(unit, targetRow.index, targetRow.farRightUnitIndex)
					})
				})
			})
	}
}
