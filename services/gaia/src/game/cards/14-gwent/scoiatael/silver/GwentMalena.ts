import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentAmbush from '@src/game/buffs/14-gwent/BuffGwentAmbush'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getHighestUnit } from '@src/utils/Utils'

export default class GwentMalena extends ServerCard {
	public static readonly TURNS_TO_WAIT = 2
	public static readonly POWER = 5
	private turnsCounted = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF],
			features: [CardFeature.AMBUSH],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Malena`,
				description: `*Ambush*: After *${GwentMalena.TURNS_TO_WAIT}* turns, flip over and *Charm* the *Highest* Bronze or Silver enemy with *${GwentMalena.POWER}* power or less on turn start.`,
				flavor: `I hate you, dh'oine. You are all the same.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffGwentAmbush, this)
		})

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(() => this.isAmbush)
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.turnsCounted += 1
				if (this.turnsCounted !== GwentMalena.TURNS_TO_WAIT) {
					return
				}

				const unit = this.unit
				if (!unit) {
					return
				}

				Keywords.revealCard(this)

				const allUnits = game.board
					.getAllUnits()
					.filter((unit) => !unit.owner.owns(this))
					.filter((unit) => unit.isBronzeOrSilver)
					.filter((unit) => game.board.getOppositeRow(unit.boardRow).isNotFull)
					.filter((unit) => unit.stats.power <= GwentMalena.POWER)

				const target = getHighestUnit(allUnits)

				if (!target) {
					return
				}

				game.board.moveUnit(target, unit.rowIndex, unit.unitIndex, {
					charmingPlayer: unit.originalOwner,
				})
			})
	}
}
