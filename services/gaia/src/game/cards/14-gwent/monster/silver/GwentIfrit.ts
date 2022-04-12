import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentLesserIfrit from '../GwentLesserIfrit'

export default class GwentIfrit extends ServerCard {
	public static readonly SUMMON_COUNT = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CONSTRUCT],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			summonCount: GwentIfrit.SUMMON_COUNT,
		}

		this.createLocalization({
			en: {
				name: 'Ifrit',
				description: '*Spawn* {summonCount} *Lesser Ifrits* to the right of this unit.',
				flavor: "Can't stand the heat? Then you don't stand a chance.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			Keywords.summonMultipleUnits({
				owner: this.ownerPlayer,
				cardConstructor: GwentLesserIfrit,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex + 1,
				count: GwentIfrit.SUMMON_COUNT,
			})
		})
	}
}
