import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '../../../models/ServerBoardRow'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroKroLah extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_STUN],
			stats: {
				power: 7,
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
