import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

export default class HeroTroviar extends ServerCard {
	selfDamage = 40
	powerRestored = asDirectHealingPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 50,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			selfDamage: this.selfDamage,
			powerRestored: this.powerRestored,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.dealDamage(ServerDamageInstance.fromCard(this.selfDamage, this))
		})

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard !== this)
			.require(() => this.stats.power < this.stats.maxPower)
			.perform(() => {
				this.heal(ServerDamageInstance.fromCard(this.powerRestored, this))
			})
	}
}
