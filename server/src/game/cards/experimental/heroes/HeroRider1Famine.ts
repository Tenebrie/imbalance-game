import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/CardPlayTargetDefinitionBuilder'
import TargetType from '../../../shared/enums/TargetType'

export default class HeroRider1Famine extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 12
		this.baseAttack = 2
	}

	definePlayRequiredTargets(): TargetDefinitionBuilder {
		return CardPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.enemyUnit()
			.allow(TargetType.UNIT)
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const deck = thisUnit.owner.cardDeck
		const rider = deck.findCardByClass('heroRider2Conquest')
		if (rider) {
			this.game.cardPlay.forcedPlayCardFromDeck(new ServerOwnedCard(rider, thisUnit.owner), thisUnit.rowIndex, thisUnit.unitIndex + 1)
		}
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		target.dealDamage(ServerDamageInstance.fromUnit(1, thisUnit))
	}
}
