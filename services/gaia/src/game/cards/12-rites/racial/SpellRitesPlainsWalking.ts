import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import LeaderRitesPlayerUnit from '../LeaderRitesPlayerUnit'

export default class SpellRitesPlainsWalking extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Plains Walking',
				description: 'Move your hero within your current or adjacent row.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.requireAllied()
			.require(({ targetRow }) => {
				const hero = game.board.getAllUnits().find((unit) => unit.card instanceof LeaderRitesPlayerUnit)!
				return Math.abs(targetRow.index - hero.rowIndex) <= 1
			})
			.perform(({ targetRow, targetPosition }) => {
				const hero = game.board.getAllUnits().find((unit) => unit.card instanceof LeaderRitesPlayerUnit)!
				game.board.moveUnit(hero, targetRow.index, targetPosition)
			})
	}
}
