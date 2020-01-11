import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitBlackWolf extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'unitBlackWolf')
		this.baseAttack = 4
		this.baseHealth = 10
		this.baseInitiative = 4
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const otherBlackWolves = this.game.board.getAllCards().filter(unit => !(unit instanceof UnitBlackWolf)).filter(unit => unit.card !== this)
		if (otherBlackWolves.length === 0) {
			return
		}

		const initiative = otherBlackWolves.sort((a, b) => a.card.initiative - b.card.initiative)[0].card.initiative
		thisUnit.setInitiative(initiative)
	}
}
