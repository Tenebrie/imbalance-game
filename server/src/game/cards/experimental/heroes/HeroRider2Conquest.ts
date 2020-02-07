import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/CardPlayTargetDefinitionBuilder'
import TargetType from '../../../shared/enums/TargetType'
import ServerGameBoardRow from '../../../models/ServerGameBoardRow'
import TargetMode from '../../../shared/enums/TargetMode'

export default class HeroRider2Conquest extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 15
		this.baseAttack = 4
	}

	definePlayRequiredTargets(): TargetDefinitionBuilder {
		return CardPlayTargetDefinitionBuilder.base(this.game)
			.singleAction()
			.allow(TargetType.BOARD_ROW)
			.validate(TargetType.BOARD_ROW, args => args.targetRow.owner === args.thisUnit.owner.opponent)
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const deck = thisUnit.owner.cardDeck
		const rider = deck.findCardByClass('heroRider1Famine')
		if (rider) {
			this.game.cardPlay.forcedPlayCardFromDeck(new ServerOwnedCard(rider, thisUnit.owner), thisUnit.rowIndex, thisUnit.unitIndex)
		}
	}

	onUnitPlayTargetRowSelected(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.game.board.orders.performRowAttack(TargetMode.ATTACK_ORDERED, thisUnit, target)
		if (target.owner === thisUnit.owner.opponent && target.cards.length === 0) {
			target.setOwner(thisUnit.owner)
		}
	}
}
