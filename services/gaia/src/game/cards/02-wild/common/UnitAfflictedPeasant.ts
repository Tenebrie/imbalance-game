import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import UnitAfflictedWerewolf from '@src/game/cards/02-wild/common/UnitAfflictedWerewolf'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitAfflictedPeasant extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_BUFF_ROW_BLOOD_MOON],
			stats: {
				power: 16,
			},
			expansionSet: ExpansionSet.BASE,
			relatedCards: [UnitAfflictedWerewolf],
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(({ triggeringUnit }) => game.board.rows[triggeringUnit.rowIndex].buffs.has(BuffRowBloodMoon))
			.perform(({ triggeringUnit }) => {
				Keywords.transformUnit(triggeringUnit, UnitAfflictedWerewolf)
			})

		this.createCallback(GameEventType.ROW_BUFF_CREATED, [CardLocation.BOARD])
			.require(({ triggeringBuff }) => triggeringBuff instanceof BuffRowBloodMoon)
			.requireImmediate(({ triggeringBuff }) => !!this.unit && this.unit.rowIndex === triggeringBuff.parent.index)
			.perform(() => {
				Keywords.transformUnit(this.unit, UnitAfflictedWerewolf)
			})
	}
}
