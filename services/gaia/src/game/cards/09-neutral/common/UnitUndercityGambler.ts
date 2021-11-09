import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitUndercityGambler extends ServerCard {
	bonusPower = asDirectBuffPotency(10)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			generatedArtworkMagicString: '2',
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireSamePlayer()
			.require((args) => !args.targetCard.features.includes(CardFeature.TEMPORARY_CARD))
			.perform(({ targetCard }) => {
				const owner = targetCard.ownerPlayer
				Keywords.returnCardFromHandToDeck(targetCard)
				const drawnCards = owner.drawUnitCards(1)
				if (drawnCards.length === 0) {
					return
				}
				drawnCards.forEach((card) => {
					card.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
				})
			})
	}
}
