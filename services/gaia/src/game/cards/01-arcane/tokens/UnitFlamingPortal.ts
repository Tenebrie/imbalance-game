import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitFlamingShadow from '@src/game/cards/01-arcane/tokens/UnitFlamingShadow'
import Keywords from '@src/utils/Keywords'
import { asRecurringSummonCount } from '@src/utils/LeaderStats'

import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitFlamingPortal extends ServerCard {
	public static readonly BASE_SHADOWS_SUMMONED = 1
	private shadowsSummoned = asRecurringSummonCount(UnitFlamingPortal.BASE_SHADOWS_SUMMONED)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitFlamingShadow],
			stats: {
				power: 7,
				armor: 7,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
			generatedArtworkMagicString: '2',
		})
		this.dynamicTextVariables = {
			extraShadows: () => this.shadowsSummoned(this) > 1,
			shadowsSummoned: this.shadowsSummoned,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createLocalization({
			en: {
				name: 'Flaming Portal',
				description: '*Turn end:*\n*Summon* a *Flaming Shadow*.<if extraShadows><p>Repeat this {shadowsSummoned} times.</if>',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const unit = this.unit
				if (!unit) {
					return
				}

				Keywords.summonMultipleUnits({
					owner: this.ownerPlayer,
					cardConstructor: UnitFlamingShadow,
					rowIndex: unit.rowIndex,
					unitIndex: unit.unitIndex + 1,
					count: this.shadowsSummoned,
				})
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get baseThreat(): number {
		return 5
	}
}
