import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '../../../models/ServerBoardRow'
import TargetMode from '@shared/enums/TargetMode'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroRider2Conquest extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 15
		this.baseAttack = 4
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.BOARD_ROW)
			.validate(TargetType.BOARD_ROW, args => args.targetRow.owner === args.thisUnit.owner.opponent)
	}

	onPlayedAsUnit(thisUnit: ServerUnit): void {
		const deck = thisUnit.owner.cardDeck
		const rider = deck.findCardByClass('heroRider1Famine')
		if (rider) {
			this.game.cardPlay.forcedPlayCardFromDeck(new ServerOwnedCard(rider, thisUnit.owner), thisUnit.rowIndex, thisUnit.unitIndex)
		}
	}

	onUnitPlayTargetRowSelected(thisUnit: ServerUnit, target: ServerBoardRow): void {
		this.game.board.orders.performRowAttack(TargetMode.ATTACK_ORDERED, thisUnit, target)
		if (target.owner === thisUnit.owner.opponent && target.cards.length === 0) {
			target.setOwner(thisUnit.owner)
		}
	}
}
