import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import BuffWeakness from '@src/game/buffs/BuffWeakness'

export default class UnitEternalDeceit extends ServerCard {
	powerPerCard = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.MANIFESTATION],
			stats: {
				power: 30,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard,
		}
		this.createLocalization({
			en: {
				name: 'Eternal Deceit',
				description: 'Whenever a unit card is played, lose {powerPerCard} Power.',
			},
		})

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.UNIT)
			.require(({ triggeringCard }) => triggeringCard !== this)
			.perform(() => {
				this.buffs.addMultiple(BuffWeakness, this.powerPerCard, this)
			})
	}
}