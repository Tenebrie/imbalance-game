import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType from '../../../models/events/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import MoveDirection from '@shared/enums/MoveDirection'

export default class UnitWoodenPalisade extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.BUILDING],
			stats: {
				power: 0,
				armor: 5
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard.owner === this.owner)
			.require(({ targetCard }) => {
				const thisUnit = this.unit!
				const targetUnit = targetCard.unit!
				const direction = this.game.board.getMoveDirection(this.ownerInGame, this.game.board.rows[thisUnit.rowIndex], this.game.board.rows[targetUnit.rowIndex])
				const horizontalDistance = this.game.board.getHorizontalUnitDistance(thisUnit, targetUnit)
				return direction === MoveDirection.BACK && horizontalDistance < 1
			})
			.replace(values => ({
				...values,
				targetCard: this
			}))

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(({ triggeringUnit }) => {
				const leftPalisade = new UnitWoodenPalisade(this.game)
				const rightPalisade = new UnitWoodenPalisade(this.game)
				this.game.animation.instantThread(() => {
					this.game.board.createUnit(leftPalisade, this.ownerInGame, triggeringUnit.rowIndex, triggeringUnit.unitIndex)
				})
				this.game.animation.instantThread(() => {
					this.game.board.createUnit(rightPalisade, this.ownerInGame, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
				})
			})
	}
}
