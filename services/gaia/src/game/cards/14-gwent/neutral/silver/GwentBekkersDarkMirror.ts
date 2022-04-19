import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getHighestUnit, getLowestUnit } from '@src/utils/Utils'

export default class GwentBekkersDarkMirror extends ServerCard {
	public static readonly POWER_TO_TRANSFER = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Bekker's Dark Mirror`,
				description: `Weaken the *Highest* unit by up *${GwentBekkersDarkMirror.POWER_TO_TRANSFER}* to boost the *Lowest* unit by the same amount.`,
				flavor: `Gaze long into the abyss, and the abyss will gaze back into you.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const allUnits = game.board.getAllTargetableUnits()
			const highestUnit = getHighestUnit(allUnits)
			if (!highestUnit) {
				return
			}
			const allOtherUnits = allUnits.filter((unit) => unit !== highestUnit)
			const lowestUnit = getLowestUnit(allOtherUnits)
			if (!lowestUnit) {
				return
			}

			const damage = Math.min(GwentBekkersDarkMirror.POWER_TO_TRANSFER, highestUnit.stats.power)
			highestUnit.weaken(damage, this, 'parallel')
			lowestUnit.boost(damage, this, 'parallel')
		})
	}
}
