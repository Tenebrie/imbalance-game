import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { asRecurringSummonCount } from '@src/utils/LeaderStats'

import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import UnitShadow from './UnitShadow'

export default class UnitVoidPortal extends ServerCard {
	public static readonly BASE_SHADOWS_SUMMONED = 1
	private shadowsSummoned = asRecurringSummonCount(UnitVoidPortal.BASE_SHADOWS_SUMMONED)

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
			extraShadows: () => this.shadowsSummoned(this) > 1,
			shadowsSummoned: this.shadowsSummoned,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createLocalization({
			en: {
				name: 'Void Portal',
				description: '*Turn end:*\n*Summon* a *Shadow*.<if extraShadows><p>Repeat this {shadowsSummoned} times.</if>',
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

		Keywords.summonMultipleUnits({
			owner: this.ownerPlayer,
			cardConstructor: UnitShadow,
			rowIndex: unit.rowIndex,
			unitIndex: unit.unitIndex + 1,
			count: this.shadowsSummoned,
		})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get baseThreat(): number {
		return 5
	}
}
