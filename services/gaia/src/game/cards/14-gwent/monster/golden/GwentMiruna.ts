import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentMiruna extends ServerCard {
	public static readonly TURNS_TO_WAIT = 2
	private turnsCounted = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			tribes: [CardTribe.BEAST],
			faction: CardFaction.MONSTER,
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			turnsToWait: GwentMiruna.TURNS_TO_WAIT,
		}

		this.createLocalization({
			en: {
				name: 'Miruna',
				description: 'After {turnsToWait} turns, *Charm* the *Highest* enemy on the opposite row on turn start.',
				flavor: 'Why fight? There are much better ways to work off excess energy…',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => (this.turnsCounted = 0))

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.turnsCounted += 1
				if (this.turnsCounted !== GwentMiruna.TURNS_TO_WAIT) {
					return
				}

				const unit = this.unit
				if (!unit) {
					return
				}

				const oppositeRow = game.board.getOppositeRow(unit.rowIndex)
				if (oppositeRow.cards.length === 0) {
					return
				}

				const sortedUnits = oppositeRow.cards.sort((a, b) => b.card.stats.power - a.card.stats.power)
				const highestPower = sortedUnits[0].card.stats.power
				const highestUnits = sortedUnits.filter((unit) => unit.card.stats.power === highestPower)
				const target = getRandomArrayValue(highestUnits)

				game.board.moveUnit(target, unit.rowIndex, unit.unitIndex, {
					charmingPlayer: unit.originalOwner,
				})
			})
	}
}
