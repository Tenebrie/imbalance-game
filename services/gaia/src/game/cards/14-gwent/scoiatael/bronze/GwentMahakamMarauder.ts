import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamMarauder extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentMahakamMarauder.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Mahakam Marauder',
				description: "Whenever this unit's power changes, except when *Reset*, boost self by {boost}.",
				flavor: "Hunting on Mahakam's craggy cliffs is not particularly easy… but nor are dwarves particularly put off by danger.",
			},
		})

		const buffEffect = () => {
			this.buffs.addMultiple(BuffStrength, GwentMahakamMarauder.BOOST, this)
		}

		this.createEffect(GameEventType.CARD_TAKES_DAMAGE).perform(() => buffEffect())
		this.createEffect(GameEventType.CARD_POWER_RESTORED).perform(() => buffEffect())
		this.createCallback(GameEventType.CARD_MULTIBUFF_CREATED, [CardLocation.BOARD])
			.require(({ source }) => source !== this)
			.require(({ triggeringBuff }) => triggeringBuff.parent === this)
			.require(({ triggeringBuff }) => triggeringBuff instanceof BuffStrength || triggeringBuff instanceof BuffBaseStrength)
			.perform(() => buffEffect())
	}
}
