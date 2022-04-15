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

export default class GwentDolBlathannaSentry extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentDolBlathannaSentry.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Dol Blathanna Sentry',
				description: 'If in hand, deck or on board, boost self by {boost} whenever you play a special card.',
				flavor: "As long as we stand, no human foot shall trample Dol Blathanna's meadows.",
			},
		})

		this.createCallback(GameEventType.CARD_RESOLVED, [CardLocation.BOARD, CardLocation.DECK, CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard.ownerGroup.owns(this))
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentDolBlathannaSentry.BOOST, this)
			})
	}
}
