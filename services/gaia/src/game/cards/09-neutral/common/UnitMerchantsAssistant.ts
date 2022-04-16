import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

import BuffNextSpellThisRoundDiscountAura from '../../../buffs/BuffNextSpellThisRoundDiscountAura'

export default class UnitMerchantsAssistant extends ServerCard {
	public static readonly BASE_SPELL_DISCOUNT = 3
	spellDiscount = asDirectBuffPotency(UnitMerchantsAssistant.BASE_SPELL_DISCOUNT)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			spellDiscount: this.spellDiscount,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.ownerPlayer
		player.leader.buffs.addMultiple(BuffNextSpellThisRoundDiscountAura, this.spellDiscount, this, BuffDuration.INFINITY)
	}
}
