import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType from '../../../models/GameHookType'
import MoveDirection from '@shared/enums/MoveDirection'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ServerUnit from '../../../models/ServerUnit'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroAurienne extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createHook(GameHookType.UNIT_DESTROYED, [CardLocation.HAND])
			.require(({ targetUnit }) => targetUnit.owner === this.owner)
			.replace(values => ({
				...values,
				destructionPrevented: true
			}))
			.perform(({ targetUnit }) => this.onUnitDestroyedHook(targetUnit))
	}

	private onUnitDestroyedHook(targetUnit: ServerUnit): void {
		const ownedCard = {
			card: this,
			owner: this.owner!
		}

		const targetRowIndex = this.game.board.rowMove(this.owner!, targetUnit.rowIndex, MoveDirection.BACK, 1)
		const targetUnitIndex = targetUnit.unitIndex

		this.game.cardPlay.forcedPlayCardFromHand(ownedCard, targetUnit.rowIndex, targetUnit.unitIndex)
		if (targetUnit.isAlive()) {
			this.game.board.moveUnit(targetUnit, targetRowIndex, targetUnitIndex)
		}
		this.owner!.drawUnitCards(1)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
