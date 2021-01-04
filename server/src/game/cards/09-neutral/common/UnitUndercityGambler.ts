import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

export default class UnitUndercityGambler extends ServerCard {
	bonusPower = asDirectBuffPotency(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			generatedArtworkMagicString: '2',
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.require((args) => !args.targetCard.features.includes(CardFeature.TEMPORARY_CARD))
			.perform(({ targetCard }) => {
				const owner = targetCard.ownerInGame
				owner.cardHand.discardCard(targetCard)
				owner.cardDeck.addUnitToBottom(targetCard)
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
