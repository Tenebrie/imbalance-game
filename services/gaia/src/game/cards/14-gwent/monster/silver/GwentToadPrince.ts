import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentToadPrince extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CURSED],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Toad Prince',
				description: 'Draw a unit, then *Consume* a unit in your hand and boost self by its power.',
				flavor: 'Big, bad, ugly. Squats in the sewers.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.draw.topUnitCard(this.ownerPlayer)
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.perform(({ targetCard }) => {
				Keywords.consume.cards({
					consumer: this,
					targets: [targetCard],
				})
			})
	}
}
