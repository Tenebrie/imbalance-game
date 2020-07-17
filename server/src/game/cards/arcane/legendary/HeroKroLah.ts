import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import Constants from '@shared/Constants'
import CardFaction from '@shared/enums/CardFaction'
import {EffectTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import MoveDirection from '@shared/enums/MoveDirection'

export default class HeroKroLah extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 7

		this.createCallback<EffectTargetSelectedEventArgs>(GameEventType.EFFECT_TARGET_SELECTED)
			.perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.allow(TargetType.BOARD_ROW)
			.opponentsRow()
			.notEmptyRow()
	}

	private onTargetSelected(target: ServerBoardRow): void {
		const targetUnits = target.cards

		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, targetUnits))

		const targetIndex = this.game.board.rowMove(this.owner, target.index, MoveDirection.FORWARD, 1)
		targetUnits.forEach(targetUnit => this.game.board.moveUnitToFarRight(targetUnit, targetIndex))
		this.game.animation.play(ServerAnimation.unitMove())

		targetUnits.forEach(targetUnit => {
			targetUnit.card.buffs.add(BuffStun, this, BuffDuration.START_OF_NEXT_TURN)
		})
		this.game.animation.play(ServerAnimation.cardReceivedBuff(targetUnits.map(unit => unit.card), BuffAlignment.NEGATIVE))
	}
}
