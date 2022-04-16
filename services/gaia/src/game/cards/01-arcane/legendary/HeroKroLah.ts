import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffStun from '../../../buffs/BuffStun'
import ServerBoardRow from '../../../models/ServerBoardRow'

export default class HeroKroLah extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.BOARD_ROW).requireEnemy().requireNotEmptyRow()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_ROW).perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	private onTargetSelected(target: ServerBoardRow): void {
		const targetUnits = target.cards

		targetUnits.forEach((targetUnit) => {
			this.game.animation.createAnimationThread()
			targetUnit.card.buffs.add(BuffStun, this, BuffDuration.START_OF_NEXT_TURN)
			this.game.board.moveUnitBack(targetUnit)
			this.game.animation.commitAnimationThread()
		})
	}
}
