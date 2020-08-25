import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import BuffSpellExtraCost from '../../../buffs/BuffSpellExtraCost'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffSpellDiscountPerTurn from '../../../buffs/BuffSpellDiscountPerTurn'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitMercantileSpellslinger extends ServerCard {
	manaMarkup = 3
	discountPerTurn = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 3
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]
		this.dynamicTextVariables = {
			manaMarkup: this.manaMarkup,
			discountPerTurn: this.discountPerTurn
		}

		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_LIBRARY)
			.validate(TargetType.CARD_IN_LIBRARY, (args => args.targetCard.tribes.includes(CardTribe.SCROLL)))
	}

	private onTargetSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateByInstance(this.game, target)
		newCard.buffs.addMultiple(BuffSpellExtraCost, this.manaMarkup, this, BuffDuration.INFINITY)
		newCard.buffs.addMultiple(BuffSpellDiscountPerTurn, this.discountPerTurn, this, BuffDuration.INFINITY)
		this.owner.cardHand.addSpell(newCard)
	}
}
