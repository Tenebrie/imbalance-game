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

		const pushDirection = target.index - this.unit.rowIndex

		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, targetUnits))
		targetUnits.forEach(targetUnit => {
			targetUnit.card.buffs.add(BuffStun, this, BuffDuration.START_OF_NEXT_TURN)
		})

		if (pushDirection > 0 && target.index < Constants.GAME_BOARD_ROW_COUNT - 1) {
			targetUnits.forEach(targetUnit => this.game.board.moveUnitToFarRight(targetUnit, target.index + 1))
		} else if (pushDirection < 0 && target.index > 0) {
			targetUnits.forEach(targetUnit => this.game.board.moveUnitToFarRight(targetUnit, target.index - 1))
		}
	}
}
