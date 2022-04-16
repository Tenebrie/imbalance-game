import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentYarpenZigrin extends ServerCard {
	protected static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentYarpenZigrin.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Yarpen Zigrin',
				description: 'Whenever a Dwarf ally appears, boost self by {boost}.',
				flavor: "Ever hear o' the dragon Ocvist? From Quartz Mountain? Well, Yarpen Zigrin and his band o' dwarves did 'im in.",
			},
		})

		this.makeResilient()

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.owner.owns(this))
			.require(({ triggeringUnit }) => triggeringUnit.card.tribes.includes(CardTribe.DWARF))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentYarpenZigrin.BOOST, this)
			})
	}
}
