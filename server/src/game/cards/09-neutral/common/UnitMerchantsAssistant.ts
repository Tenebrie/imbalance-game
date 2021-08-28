import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffNextSpellThisRoundDiscountAura from '../../../buffs/BuffNextSpellThisRoundDiscountAura'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

export default class UnitMerchantsAssistant extends ServerCard {
	spellDiscount = asDirectBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY],
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
