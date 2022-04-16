import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowRain from '@src/game/buffs/14-gwent/BuffGwentRowRain'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentTorrentialRain extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HAZARD],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: BuffGwentRowRain.DAMAGE,
			targets: BuffGwentRowRain.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Torrential Rain',
				description: 'Apply a *Hazard* to an enemy row that deals {damage} damage to {targets} random units on turn start.',
				flavor: 'Even the rain in this land smells vile.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowRain, this)
			})
	}
}
