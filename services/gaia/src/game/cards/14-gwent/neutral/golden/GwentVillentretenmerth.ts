import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getAllHighestUnits } from '@src/utils/Utils'

import GwentMiruna from '../../monster/golden/GwentMiruna'

export default class GwentVillentretenmerth extends ServerCard {
	public static readonly TURNS_TO_WAIT = 3

	private turnsCounted = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 10,
				armor: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Villentretenmerth`,
				description: `After *${GwentVillentretenmerth.TURNS_TO_WAIT}* turns, destroy all the other *Highest* units on turn start.`,
				flavor: `Also calls himself Borkh Three Jackdaws… he's not the best at names.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => (this.turnsCounted = 0))

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.turnsCounted += 1
				if (this.turnsCounted !== GwentMiruna.TURNS_TO_WAIT) {
					return
				}

				const allEnemies = game.board.getSplashableUnitsForOpponentOf(this)
				const targets = getAllHighestUnits(allEnemies)
				targets.forEach((unit) => {
					Keywords.destroyUnit({
						unit,
						source: this,
						threadType: 'stagger',
					})
				})
			})
	}
}
