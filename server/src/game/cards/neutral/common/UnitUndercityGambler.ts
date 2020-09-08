import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitUndercityGambler extends ServerCard {
	bonusPower = 5

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

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.require(TargetType.CARD_IN_UNIT_HAND)
			.validate(TargetType.CARD_IN_UNIT_HAND, args => !args.targetCard.features.includes(CardFeature.TEMPORARY_CARD))
			.inPlayersHand()
	}

	private onTargetSelected(target: ServerCard): void {
		const owner = target.owner
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
