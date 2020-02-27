import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import TargetMode from '@shared/enums/TargetMode'
import CardColor from '@shared/enums/CardColor'

export default class heroRider3War extends ServerCard {
	targets = 3
	alliesSelected: ServerUnit[] = []
	enemiesSelected: ServerUnit[] = []

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 20
		this.baseAttack = 4
		this.dynamicTextVariables = {
			targets: this.targets
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.multipleTargets(this.targets * 2)
			.unique(TargetType.UNIT)
			.allow(TargetType.UNIT, this.targets * 2)
			.validate(TargetType.UNIT, args => {
				return args.targetUnit.owner === args.thisUnit.owner && this.alliesSelected.length < this.targets || args.targetUnit.owner !== args.thisUnit.owner && this.enemiesSelected.length < this.targets
			})
	}

	onPlayedAsUnit(thisUnit: ServerUnit): void {
		const deck = thisUnit.owner.cardDeck
		const rider = deck.findCardByClass('heroRider2Conquest')
		if (rider) {
			this.game.cardPlay.forcedPlayCardFromDeck(new ServerOwnedCard(rider, thisUnit.owner), thisUnit.rowIndex, thisUnit.unitIndex)
		}
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		if (thisUnit.owner === target.owner) {
			this.alliesSelected.push(target)
		} else {
			this.enemiesSelected.push(target)
		}
	}

	onUnitPlayTargetsConfirmed(thisUnit: ServerUnit): void {
		if (this.alliesSelected.length === 0 || this.enemiesSelected.length === 0) {
			return
		}

		for (let i = 0; i < this.targets; i++) {
			let currentAlly = this.alliesSelected[i % this.alliesSelected.length]
			let currentEnemy = this.enemiesSelected[i % this.enemiesSelected.length]
			this.game.board.orders.performUnitAttack(TargetMode.ATTACK_FORCED, currentAlly, currentEnemy)
			this.game.board.orders.performUnitAttack(TargetMode.ATTACK_FORCED, currentEnemy, currentAlly)
		}
	}
}
