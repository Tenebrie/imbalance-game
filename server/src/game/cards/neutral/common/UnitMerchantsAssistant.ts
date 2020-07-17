import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import BuffSpellDiscountSingular from '../../../buffs/BuffSpellDiscountSingular'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffSpellDiscountAura from '../../../buffs/BuffSpellDiscountAura'

export default class UnitMerchantsAssistant extends ServerCard {
	spellDiscount = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 5
		this.baseTribes = [CardTribe.HUMAN]
		this.dynamicTextVariables = {
			spellDiscount: this.spellDiscount
		}

		this.createCallback(GameEventType.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		const alliedSpells = player.cardHand.spellCards
		this.owner.leader.buffs.addMultiple(BuffSpellDiscountAura, this.spellDiscount, this, BuffDuration.INFINITY)
		alliedSpells.forEach(spell => spell.buffs.addMultiple(BuffSpellDiscountSingular, this.spellDiscount, this, BuffDuration.INFINITY))
	}
}
