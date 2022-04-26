import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import GwentArachasDrone from './GwentArachasDrone'

export default class GwentArachasBehemoth extends ServerCard {
	public static readonly TRIGGER_COUNT = 4

	private triggersRemaining = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			triggerCount: GwentArachasBehemoth.TRIGGER_COUNT,
		}

		this.createLocalization({
			en: {
				name: 'Arachas Behemoth',
				description: 'The next {triggerCount} times you *Consume* a unit, *Spawn* an *Arachas Drone* on a random row.',
				flavor: 'Like a cross between a crab, a spider… and a mountain.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.triggersRemaining = GwentArachasBehemoth.TRIGGER_COUNT
		})

		this.createCallback(GameEventType.UNIT_CONSUMED, [CardLocation.BOARD])
			.require(() => this.triggersRemaining > 0)
			.perform(() => {
				this.triggersRemaining -= 1
				const validRows = game.board.getControlledRows(this.ownerGroup).filter((row) => !row.isFull())
				const targetRow = getRandomArrayValue(validRows)
				if (!targetRow) {
					return
				}

				Keywords.summonUnit({
					owner: this.ownerPlayer,
					cardConstructor: GwentArachasDrone,
					rowIndex: targetRow.index,
					unitIndex: targetRow.farRightUnitIndex,
				})
			})
	}
}
