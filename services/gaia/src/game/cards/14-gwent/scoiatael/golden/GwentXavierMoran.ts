import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentXavierMoran extends ServerCard {
	lastPlayedDwarf?: ServerCard

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Xavier Moran',
				description: 'Boost this unit by the default power of the last other Dwarf you played.',
				flavor: "Well? Somethin' wrong? Venison a wee bit rank for ye? Ehh, princess?",
			},
		})

		this.createCallback(GameEventType.CARD_PLAYED, 'any')
			.require(({ owner }) => owner.group.owns(this))
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.DWARF))
			.perform(({ triggeringCard }) => {
				this.lastPlayedDwarf = triggeringCard
			})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => !!this.lastPlayedDwarf)
			.perform(() => {
				this.buffs.addMultiple(BuffBaseStrength, this.lastPlayedDwarf!.stats.basePower, this)
			})
	}
}
