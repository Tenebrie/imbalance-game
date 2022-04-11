import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentFullMoon from '@src/game/buffs/14-gwent/BuffGwentFullMoon'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import ServerUnit from '@src/game/models/ServerUnit'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GwentWolf from './GwentWolf'

export default class GwentAlphaWerewolf extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST, CardTribe.CURSED],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Alpha Werewolf',
				description: '*Spawn* a *Wolf* on each side of this unit on contact with *Full Moon*.',
				flavor:
					"Some say lycanthropy's contagious - get bit by a werewolf, you turn into one yourself. Witchers know that's nonsense, of course - only a powerful curse can bring on this condition.",
			},
		})

		const onContact = (triggeringUnit: ServerUnit) => {
			Keywords.summonUnit({
				owner: this.ownerPlayer,
				cardConstructor: GwentWolf,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex,
			})
			Keywords.summonUnit({
				owner: this.ownerPlayer,
				cardConstructor: GwentWolf,
				rowIndex: triggeringUnit.rowIndex,
				unitIndex: triggeringUnit.unitIndex + 1,
			})
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(({ triggeringUnit }) => game.board.rows[triggeringUnit.rowIndex].buffs.has(BuffRowBloodMoon))
			.perform(({ triggeringUnit }) => onContact(triggeringUnit))

		this.createEffect(GameEventType.UNIT_MOVED)
			.require(({ toIndex }) => game.board.rows[toIndex].buffs.has(BuffRowBloodMoon))
			.perform(({ triggeringUnit }) => onContact(triggeringUnit))

		this.createCallback(GameEventType.ROW_BUFF_CREATED, [CardLocation.BOARD])
			.require(({ triggeringBuff }) => triggeringBuff instanceof BuffGwentFullMoon)
			.requireImmediate(({ triggeringBuff }) => !!this.unit && this.unit.rowIndex === triggeringBuff.parent.index)
			.perform(() => onContact(this.unit!))
	}
}
