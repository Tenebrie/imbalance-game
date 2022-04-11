import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
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
				const validRows = game.board.getControlledRows(this.ownerGroup).filter((row) => !row.isFull())
				if (validRows.length === 0) {
					return
				}

				this.triggersRemaining -= 1
				const targetRow = getRandomArrayValue(validRows)
				Keywords.summonUnit({
					owner: this.ownerPlayer,
					cardConstructor: GwentArachasDrone,
					rowIndex: targetRow.index,
					unitIndex: targetRow.farRightUnitIndex,
				})
			})
	}
}
