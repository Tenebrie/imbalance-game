import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import BuffSpellDiscount from '../../../buffs/BuffSpellDiscount'
import CardLibrary from '../../../libraries/CardLibrary'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

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
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			spellDiscount: this.spellDiscount,
		}
		this.addRelatedCards().requireTribe(CardTribe.SCROLL)

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(() => this.didInfuse)
			.require((args) => args.targetCard.tribes.includes(CardTribe.SCROLL))

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => this.ownerPlayer.spellMana >= this.infuseCost)
			.perform(() => Keywords.infuse(this, this.infuseCost))
			.perform(() => (this.didInfuse = true))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.onTargetsConfirmed())
	}

	private onTargetSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateFromInstance(this.game, target)
		newCard.buffs.addMultiple(BuffSpellDiscount, this.spellDiscount, this, BuffDuration.INFINITY)
		this.ownerPlayer.cardHand.addSpell(newCard)
	}

	private onTargetsConfirmed(): void {
		this.didInfuse = false
	}
}
