import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getHighestUnit } from '@src/utils/Utils'

export default class GwentMilva extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Milva`,
				description: `Return each player's *Highest* Bronze or Silver unit to their deck.`,
				flavor: `With each arrow I loose, I think of my da. He'd be proud. I think.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const allEnemyUnits = game.board
				.getAllUnits()
				.filter((unit) => !unit.owner.owns(this))
				.filter((unit) => unit.isBronzeOrSilver)

			const enemyTarget = getHighestUnit(allEnemyUnits)

			if (enemyTarget) {
				Keywords.returnCardFromBoardToDeck(enemyTarget)
			}

			const allAllyUnits = game.board
				.getAllUnits()
				.filter((unit) => unit.owner.owns(this))
				.filter((unit) => unit.isBronzeOrSilver)

			const allyTarget = getHighestUnit(allAllyUnits)

			if (allyTarget) {
				Keywords.returnCardFromBoardToDeck(allyTarget)
			}
		})
	}
}
