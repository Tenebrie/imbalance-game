import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitEternalTruth extends ServerCard {
	powerPerCard = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.MANIFESTATION],
			stats: {
				power: 15,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard,
		}
		this.createLocalization({
			en: {
				name: 'Eternal Truth',
				description: 'Whenever a unit card is played, gain +{powerPerCard} Power.',
			},
		})

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.UNIT)
			.require(({ triggeringCard }) => triggeringCard !== this)
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, this.powerPerCard, this)
			})
	}
}
