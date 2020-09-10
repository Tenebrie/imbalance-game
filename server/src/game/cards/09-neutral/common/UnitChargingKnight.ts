import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import MoveDirection from '@shared/enums/MoveDirection'
import {TurnEndedEventArgs, UnitMovedEventArgs, UnitOrderedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCardTarget from '../../../models/ServerCardTarget'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitChargingKnight extends ServerCard {
	damage = 3
	movesForwardThisTurn = 0
	maximumMovesThisTurn = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_ORDER],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage
		}

		this.createUnitOrderTargets()
			.target(TargetType.UNIT, () => this.movesForwardThisTurn)
			.requireEnemyUnit()

		this.createCallback<UnitMovedEventArgs>(GameEventType.UNIT_MOVED, [CardLocation.BOARD])
			.require(({ direction }) => direction === MoveDirection.FORWARD)
			.require(({ triggeringUnit }) => triggeringUnit === this.unit)
			.perform(() => this.onUnitMove())

		this.createEffect<UnitOrderedEventArgs>(GameEventType.UNIT_ORDERED)
			.perform(({ targetArguments }) => this.onUnitOrdered(targetArguments))

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onTurnEnded())
	}

	private onUnitMove(): void {
		this.movesForwardThisTurn = Math.min(this.maximumMovesThisTurn, this.movesForwardThisTurn + 1)
	}

	private onUnitOrdered(targetArguments: ServerCardTarget): void {
		const targetCard = targetArguments.targetCard
		targetCard.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}

	private onTurnEnded(): void {
		this.movesForwardThisTurn = 0
	}
}
