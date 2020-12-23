import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import BuffDuration from '@shared/enums/BuffDuration'
import CardTribe from '@shared/enums/CardTribe'
import BuffSpellDiscount from '../../../buffs/BuffSpellDiscount'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class UnitHungrySpellslinger extends ServerCard {
	infuseCost = 3
	spellDiscount = 3
	didInfuse = false

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_INFUSE_X],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			spellDiscount: this.spellDiscount,
		}
		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, () => this.didInfuse)
			.require(TargetType.CARD_IN_LIBRARY, (args) => args.targetCard.tribes.includes(CardTribe.SCROLL))

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => this.ownerInGame.spellMana >= this.infuseCost)
			.perform(() => Keywords.infuse(this, this.infuseCost))
			.perform(() => (this.didInfuse = true))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.onTargetsConfirmed())
	}

	private onTargetSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateByInstance(target)
		newCard.buffs.addMultiple(BuffSpellDiscount, this.spellDiscount, this, BuffDuration.INFINITY)
		this.ownerInGame.cardHand.addSpell(newCard)
	}

	private onTargetsConfirmed(): void {
		this.didInfuse = false
	}
}
