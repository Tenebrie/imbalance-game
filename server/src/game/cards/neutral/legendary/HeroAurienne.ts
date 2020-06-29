import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHook, {UnitDestroyedHookArgs, UnitDestroyedHookValues} from '../../../models/GameHook'
import MoveDirection from '@shared/enums/MoveDirection'

export default class HeroAurienne extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.CASTLE)
		this.basePower = 11
		this.baseTribes = [CardTribe.VALKYRIE]

		this.createHook<UnitDestroyedHookValues, UnitDestroyedHookArgs>(GameHook.UNIT_DESTROYED)
			.requireLocation(CardLocation.HAND)
			.require(({ targetUnit }) => targetUnit.owner === this.owner)
			.replace(values => ({
				...values,
				destructionPrevented: true
			}))
			.perform(({ targetUnit }) => {
				const ownedCard = {
					card: this,
					owner: this.owner
				}

				const targetRowIndex = this.game.board.rowMove(this.owner, targetUnit.rowIndex, MoveDirection.BACK, 1)
				const targetUnitIndex = targetUnit.unitIndex

				this.game.cardPlay.forcedPlayCardFromHand(ownedCard, targetUnit.rowIndex, targetUnit.unitIndex)
				this.game.board.moveUnit(targetUnit, targetRowIndex, targetUnitIndex)
				this.owner.drawUnitCards(1)
			})
	}
}
