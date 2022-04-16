import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMourntart extends ServerCard {
	public static readonly POWER_PER_CARD = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.NECROPHAGE],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			powerPerCard: GwentMourntart.POWER_PER_CARD,
		}

		this.createLocalization({
			en: {
				name: 'Mourntart',
				description: '*Consume* all Bronze and Silver units in your graveyard and boost self by {powerPerCard} for each.',
				flavor:
					'Most grave hags feed on rotten remains dug out of graves. Yet some sneak into huts, steal children, kill the elderly and in general make very undesirable neighbors.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const targetCards = this.ownerPlayer.cardGraveyard.allCards
				.filter((card) => card.type === CardType.UNIT)
				.filter((card) => card.color === CardColor.BRONZE || card.color === CardColor.SILVER)
			const powerToGain = targetCards.length * GwentMourntart.POWER_PER_CARD
			targetCards.forEach((card) => {
				this.ownerPlayer.cardGraveyard.removeCard(card)
			})
			this.buffs.addMultiple(BuffStrength, powerToGain, this)
		})
	}
}
