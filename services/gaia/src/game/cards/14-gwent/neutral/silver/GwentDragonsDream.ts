import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowDragonsDream from '@src/game/buffs/14-gwent/BuffGwentRowDragonsDream'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentDragonsDream extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Dragon's Dream`,
				description: `Apply a *Hazard* to an enemy row that will explode and deal *${BuffGwentRowDragonsDream.DAMAGE}* damage to all units when a different special card is played.`,
				flavor:
					'In Zerrikania, dragon worship dominates every aspect of daily life. Thus it comes as no surprise they name weapons in their honor.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowDragonsDream, this)
			})
	}
}
