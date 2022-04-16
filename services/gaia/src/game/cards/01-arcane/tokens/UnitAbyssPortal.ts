import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import BuffStrength from '../../../buffs/BuffStrength'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitShadow from './UnitShadow'

export default class UnitAbyssPortal extends ServerCard {
	powerPerCard = asRecurringBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitShadow],
			stats: {
				power: 3,
				armor: 7,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createLocalization({
			en: {
				name: 'Abyss Portal',
				description: '*Turn end:*\n*Summon* a *Shadow*.<p>It gains bonus Power for every unique spell in your Graveyard.',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnEnded())
	}

	public onTurnEnded(): void {
		const unit = this.unit
		if (!unit) {
			return
		}
		const owner = unit.originalOwner
		const voidspawn = CardLibrary.instantiate(this.game, UnitShadow)
		this.game.board.createUnit(voidspawn, owner, unit.rowIndex, unit.unitIndex + 1)
		const uniqueSpellsInDiscard = [...new Set(owner.cardGraveyard.spellCards.map((card) => card.class))]
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
