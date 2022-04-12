import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GwentHarpyEgg from './GwentHarpyEgg'

export default class GwentCelaenoHarpy extends ServerCard {
	public static readonly EGGS_SPAWNED = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			eggsSpawned: GwentCelaenoHarpy.EGGS_SPAWNED,
		}

		this.createLocalization({
			en: {
				name: 'Celaeno Harpy',
				description: '*Spawn* {eggsSpawned} *Harpy Eggs* to the left of this unit.',
				flavor: 'Common harpies feed on carrion. Celaeno harpies… they feed on dreams.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) =>
			Keywords.summonMultipleUnits({
				owner: this.ownerPlayer,
				cardConstructor: GwentHarpyEgg,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex,
				count: GwentCelaenoHarpy.EGGS_SPAWNED,
			})
		)
	}
}
