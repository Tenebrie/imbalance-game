import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowSkelligeStorm from '@src/game/buffs/14-gwent/BuffGwentRowSkelligeStorm'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentSkelligeStorm extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HAZARD],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Skellige Storm',
				description: `Apply a *Hazard* to an enemy row that deals *${BuffGwentRowSkelligeStorm.DAMAGE[0]}*, *${BuffGwentRowSkelligeStorm.DAMAGE[1]}* and *${BuffGwentRowSkelligeStorm.DAMAGE[2]}* damage to the leftmost units on the row on turn start.`,
				flavor: "This ain't no normal storm. This here's the wrath of the gods.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowSkelligeStorm, this)
			})
	}
}
