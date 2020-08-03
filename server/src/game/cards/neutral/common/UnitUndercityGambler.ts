import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import BuffTutoredCard from '../../../buffs/BuffTutoredCard'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class UnitUndercityGambler extends ServerCard {
	bonusPower = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 4
		this.generatedArtworkMagicString = '2'

		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.require(TargetType.CARD_IN_UNIT_HAND)
			.validate(TargetType.CARD_IN_UNIT_HAND, args => !args.targetCard.buffs.has(BuffTutoredCard))
			.inPlayersHand()
	}

	private onTargetSelected(target: ServerCard): void {
		const owner = target.owner
		owner.cardHand.discardUnit(target)
		owner.cardDeck.addUnitToBottom(target)
		const drawnCards = owner.drawUnitCards(1)
		if (drawnCards.length === 0) {
			return
		}
		drawnCards.forEach(card => {
			for (let i = 0; i < this.bonusPower; i++) {
				card.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			}
		})
	}
}
