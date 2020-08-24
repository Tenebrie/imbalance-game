import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import {TurnEndedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitVoidspawn from './UnitVoidspawn'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import {mapRelatedCards} from '../../../../utils/Utils'

export default class UnitVoidPortal extends ServerCard {
	powerPerSpell = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 0
		this.baseArmor = 5
		this.baseRelatedCards = mapRelatedCards([UnitVoidspawn])
		this.dynamicTextVariables = {
			powerPerSpell: this.powerPerSpell
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onTurnEnded())
	}

	private onTurnEnded(): void {
		const voidspawn = CardLibrary.instantiateByConstructor(this.game, UnitVoidspawn)
		this.game.board.createUnit(voidspawn, this.owner, this.unit.rowIndex, this.unit.unitIndex + 1)
		const uniqueSpellsInDiscard = [...new Set(this.owner.cardGraveyard.spellCards.map(card => card.class))]
		if (uniqueSpellsInDiscard.length === 0) {
			return
		}

		voidspawn.buffs.addMultiple(BuffStrength, uniqueSpellsInDiscard.length, this, BuffDuration.INFINITY)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get baseThreat(): number {
		return 5
	}
}
