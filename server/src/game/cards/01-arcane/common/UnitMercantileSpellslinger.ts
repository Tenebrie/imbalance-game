import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import BuffSpellExtraCost from '../../../buffs/BuffSpellExtraCost'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffSpellDiscountPerTurn from '../../../buffs/BuffSpellDiscountPerTurn'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitMercantileSpellslinger extends ServerCard {
	manaMarkup = 3
	discountPerTurn = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			manaMarkup: this.manaMarkup,
			discountPerTurn: this.discountPerTurn,
		}
		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY).require((args) => args.targetCard.tribes.includes(CardTribe.SCROLL))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateFromInstance(this.game, target)
		newCard.buffs.addMultiple(BuffSpellExtraCost, this.manaMarkup, this, BuffDuration.INFINITY)
		newCard.buffs.addMultiple(BuffSpellDiscountPerTurn, this.discountPerTurn, this, BuffDuration.INFINITY)
		this.ownerPlayerInGame.cardHand.addSpell(newCard)
	}
}
