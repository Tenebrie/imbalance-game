import CardType from '@shared/enums/CardType'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'

export default class UnitPrototypeScorpionCrew extends ServerCard {
	targetDamage = asDirectUnitDamage(3)
	selfDamage = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_ORDER],
			stats: {
				power: 5,
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
				targetCard.dealDamage(ServerDamageInstance.fromCard(damage, this))
			})
			this.game.animation.instantThread(() => {
				this.dealDamage(ServerDamageInstance.fromCard(this.selfDamage, this))
			})
		})
	}
}
