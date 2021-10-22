import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

export default class UnitPrototypeScorpionCrew extends ServerCard {
	targetDamage = asRecurringUnitDamage(5)
	selfDamage = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_ORDER],
			stats: {
				power: 10,
				armor: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targetDamage: this.targetDamage,
			selfDamage: this.selfDamage,
		}

		this.createOrderTargets(TargetType.UNIT).targetCount(Infinity).requireEnemy()

		this.createEffect(GameEventType.UNIT_ORDERED_UNIT).perform(({ targetCard }) => {
			const damage = this.targetDamage(this)
			this.game.animation.instantThread(() => {
				targetCard.dealDamage(DamageInstance.fromCard(damage, this))
			})
			this.game.animation.instantThread(() => {
				this.dealDamage(DamageInstance.fromCard(this.selfDamage, this))
			})
			this.game.animation.syncAnimationThreads()
		})
	}
}
