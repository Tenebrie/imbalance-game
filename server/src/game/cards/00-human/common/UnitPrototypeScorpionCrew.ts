import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import { asDirectUnitDamage } from '../../../../utils/LeaderStats'

export default class UnitPrototypeScorpionCrew extends ServerCard {
	targetDamage = asDirectUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targetDamage: this.targetDamage,
		}

		this.createUnitOrderTargets().target(TargetType.UNIT, Infinity).requireEnemyUnit()

		this.createEffect(GameEventType.UNIT_ORDERED_UNIT).perform(({ targetCard }) => {
			const damage = this.targetDamage(this)
			this.game.animation.instantThread(() => {
				targetCard.dealDamage(ServerDamageInstance.fromCard(damage, this))
			})
			this.game.animation.instantThread(() => {
				this.dealDamage(ServerDamageInstance.fromCard(damage, this))
			})
		})
	}
}
