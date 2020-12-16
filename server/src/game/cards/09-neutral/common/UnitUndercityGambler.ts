import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import {asSoloBuffPotency} from '../../../../utils/LeaderStats'

export default class UnitUndercityGambler extends ServerCard {
	bonusPower = asSoloBuffPotency(5)

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
			bonusPower: this.bonusPower
		}

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_UNIT_HAND)
			.require(TargetType.CARD_IN_UNIT_HAND, args => !args.targetCard.features.includes(CardFeature.TEMPORARY_CARD))
			.requireCardInPlayersHand()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		const owner = target.ownerInGame
		owner.cardHand.discardCard(target)
		owner.cardDeck.addUnitToBottom(target)
		const drawnCards = owner.drawUnitCards(1)
		if (drawnCards.length === 0) {
			return
		}
		drawnCards.forEach(card => {
			card.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
		})
	}
}
