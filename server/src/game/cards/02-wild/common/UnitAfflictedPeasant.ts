import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitAfflictedWerewolf from '@src/game/cards/02-wild/common/UnitAfflictedWerewolf'
import GameEventType from '@shared/enums/GameEventType'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import Keywords from '@src/utils/Keywords'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'

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
