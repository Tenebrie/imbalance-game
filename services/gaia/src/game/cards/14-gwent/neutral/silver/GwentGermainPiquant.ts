import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentCow from '../bronze/GwentCow'

export default class GwentGermainPiquant extends ServerCard {
	public static readonly COWS_PER_SIDE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.OFFICER],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Germain Piquant`,
				description: `*Spawn* *${GwentGermainPiquant.COWS_PER_SIDE}* Cows on each side of this unit.`,
				flavor: `The hero Toussaint needs, but not the one it deserves.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner, triggeringUnit }) => {
			Keywords.summonMultipleUnits({
				owner,
				cardConstructor: GwentCow,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex,
				count: GwentGermainPiquant.COWS_PER_SIDE,
				threadType: 'parallel',
			})
			Keywords.summonMultipleUnits({
				owner,
				cardConstructor: GwentCow,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex + 1,
				count: GwentGermainPiquant.COWS_PER_SIDE,
				threadType: 'parallel',
			})
		})
	}
}
