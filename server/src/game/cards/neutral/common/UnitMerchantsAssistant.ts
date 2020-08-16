import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import BuffNextSpellDiscount from '../../../buffs/BuffNextSpellDiscount'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffNextSpellDiscountAura from '../../../buffs/BuffNextSpellDiscountAura'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitMerchantsAssistant extends ServerCard {
	spellDiscount = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 5
		this.baseTribes = [CardTribe.HUMAN]
		this.dynamicTextVariables = {
			spellDiscount: this.spellDiscount
		}
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		const alliedSpells = player.cardHand.spellCards
		this.owner.leader.buffs.addMultiple(BuffNextSpellDiscountAura, this.spellDiscount, this, BuffDuration.INFINITY)
		alliedSpells.forEach(spell => spell.buffs.addMultiple(BuffNextSpellDiscount, this.spellDiscount, this, BuffDuration.INFINITY))
	}
}
