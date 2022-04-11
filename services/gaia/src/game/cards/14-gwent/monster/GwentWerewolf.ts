import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentFullMoon from '@src/game/buffs/14-gwent/BuffGwentFullMoon'
import BuffPermanentImmunity from '@src/game/buffs/BuffPermanentImmunity'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentWerewolf extends ServerCard {
	public static EXTRA_POWER = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST, CardTribe.CURSED],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.buffs.add(BuffPermanentImmunity, this)

		this.createLocalization({
			en: {
				name: 'Werewolf',
				description: 'Boost this unit by 7 on first contact with *Full Moon*.',
				flavor:
					"Some say lycanthropy's contagious - get bit by a werewolf, you turn into one yourself. Witchers know that's nonsense, of course - only a powerful curse can bring on this condition.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(({ triggeringUnit }) => game.board.rows[triggeringUnit.rowIndex].buffs.has(BuffRowBloodMoon))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentWerewolf.EXTRA_POWER, this)
			})

		this.createEffect(GameEventType.UNIT_MOVED)
			.require(({ toIndex }) => game.board.rows[toIndex].buffs.has(BuffRowBloodMoon))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentWerewolf.EXTRA_POWER, this)
			})

		this.createCallback(GameEventType.ROW_BUFF_CREATED, [CardLocation.BOARD])
			.require(({ triggeringBuff }) => triggeringBuff instanceof BuffGwentFullMoon)
			.requireImmediate(({ triggeringBuff }) => !!this.unit && this.unit.rowIndex === triggeringBuff.parent.index)
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentWerewolf.EXTRA_POWER, this)
			})
	}
}
