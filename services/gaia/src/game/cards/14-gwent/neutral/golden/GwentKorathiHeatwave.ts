import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentRowHeatwave from '@src/game/buffs/14-gwent/BuffGwentRowHeatwave'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentKorathiHeatwave extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
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
				name: `Korathi Heatwave`,
				description: `Apply a *Hazard* to each enemy row that deals *${BuffGwentRowHeatwave.DAMAGE}* damage to the *Lowest* unit on turn start.`,
				flavor: `Vicovaro scholars have determined that, in the absence of imperial aid, drought-stricken provinces lose half their population, two-thirds of their livestock and all their will to rebel.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const allEnemyRows = game.board.getControlledRows(owner.opponent)
			allEnemyRows.forEach((row) => {
				game.animation.thread(() => {
					row.buffs.add(BuffGwentRowHeatwave, this)
				})
			})
		})
	}
}
