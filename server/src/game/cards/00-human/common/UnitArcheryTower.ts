import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { ServerCardTargetUnit } from '../../../models/ServerCardTarget'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFeature from '@shared/enums/CardFeature'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'
import BuffCanAttack from '../../../buffs/BuffCanAttack'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitArcheryTower extends ServerCard {
	damage = asRecurringUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH],
			stats: {
				power: 0,
				armor: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createOrderTargets(TargetType.UNIT)
			.targetCount(() => this.buffs.getIntensity(BuffCanAttack))
			.requireEnemy()

		this.createEffect(GameEventType.UNIT_ORDERED_UNIT).perform(({ targetArguments }) => this.onAttack(targetArguments))

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.tribes.includes(CardTribe.SOLDIER))
			.requireTarget(({ target }) => this.game.board.isUnitAdjacent(this.unit, target.unit))
			.provideSelf(BuffCanAttack)
	}

	private onAttack(targetArguments: ServerCardTargetUnit): void {
		const targetCard = targetArguments.targetCard
		targetCard.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}
}
