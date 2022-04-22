import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentHawkerSmuggler extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.SUPPORT],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Hawker Smuggler`,
				description: `Whenever an enemy appears, boost self by *${GwentHawkerSmuggler.BOOST}*.`,
				flavor: `I fight for whoever's paying the best. Or whoever's easiest to rob.`,
			},
		})

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.BOARD])
			.require(({ owner }) => owner.opponent.owns(this))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentHawkerSmuggler.BOOST, this)
			})
	}
}
