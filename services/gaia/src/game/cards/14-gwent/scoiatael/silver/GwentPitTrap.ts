import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentPitTrap from '@src/game/buffs/14-gwent/BuffGwentPitTrap'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentPitTrap extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Pit Trap`,
				description: `Apply a *Hazard* to an enemy row that deals *${BuffGwentPitTrap.DAMAGE}* damage to units on contact.`,
				flavor: `Simple, cheap and deadly efficient - no wonder it's one of the Scoia'tael's favorite traps.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.totalTargetCount(1)
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentPitTrap, this)
			})
	}
}
