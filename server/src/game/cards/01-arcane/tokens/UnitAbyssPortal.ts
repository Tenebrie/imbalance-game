import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitVoidspawn from './UnitVoidspawn'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'

export default class UnitAbyssPortal extends ServerCard {
	powerPerCard = asSplashBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitVoidspawn],
			stats: {
				power: 0,
				armor: 10,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onTurnEnded())
	}

	public onTurnEnded(): void {
		const unit = this.unit
		if (!unit) {
			return
		}
		const owner = this.ownerInGame
		const voidspawn = CardLibrary.instantiateByConstructor(this.game, UnitVoidspawn)
		this.game.board.createUnit(voidspawn, unit.rowIndex, unit.unitIndex + 1)
		const uniqueCardsInBothDiscards = [
			...new Set(owner.cardGraveyard.allCards.concat(owner.opponent!.cardGraveyard.allCards).map((card) => card.class)),
		]
		if (uniqueCardsInBothDiscards.length === 0) {
			return
		}

		voidspawn.buffs.addMultiple(BuffStrength, uniqueCardsInBothDiscards.length, this, BuffDuration.INFINITY)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get baseThreat(): number {
		return 5
	}
}
