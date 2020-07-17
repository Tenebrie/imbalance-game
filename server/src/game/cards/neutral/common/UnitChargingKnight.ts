import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerBoardRow from '../../../models/ServerBoardRow'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import MoveDirection from '@shared/enums/MoveDirection'
import {TurnEndedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitChargingKnight extends ServerCard {
	movesForwardThisTurn = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 10
		this.baseAttack = 2
		this.baseTribes = [CardTribe.HUMAN]

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED)
			.requireLocation(CardLocation.BOARD)
			.require(({ player }) => player === this.owner)
			.perform(() => this.onTurnEnded())
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
			.actions(this.movesForwardThisTurn)
			.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT, this.movesForwardThisTurn)
	}

	onAfterPerformingMove(thisUnit: ServerUnit, target: ServerBoardRow, from: ServerBoardRow): void {
		if (this.game.board.getMoveDirection(this.owner, from, target) === MoveDirection.FORWARD) {
			this.movesForwardThisTurn += 1
		}
	}

	private onTurnEnded(): void {
		this.movesForwardThisTurn = 0
	}
}
