import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentVranWarrior extends ServerCard {
	public static readonly TURNS_TO_REPEAT = 2
	private turnsCounted = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.SOLDIER, CardTribe.DRACONID],
			faction: CardFaction.MONSTER,
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			turnsToRepeat: GwentVranWarrior.TURNS_TO_REPEAT,
		}

		this.createLocalization({
			en: {
				name: 'Vran Warrior',
				description: '*Consume* the unit to the right and boost self by its power.<p>Every 2 turns, repeat its ability on turn start.',
				flavor:
					'They sat still on their horses, seemingly relaxed. He saw their weapons – short spears with wide tips. Swords with oddly forged guards. Battle axes. Toothed gisarmes.',
			},
		})

		const doAbility = () => {
			this.turnsCounted = 0

			const unit = this.unit!
			const rightAdjacentUnit = game.board.getRightAdjacentUnit(unit)
			if (!rightAdjacentUnit) {
				return
			}
			Keywords.consume.units({
				targets: [rightAdjacentUnit],
				consumer: this,
			})
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => doAbility())

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD]).perform(() => {
			this.turnsCounted += 1
			if (this.turnsCounted >= GwentVranWarrior.TURNS_TO_REPEAT) {
				doAbility()
			}
		})
	}
}
