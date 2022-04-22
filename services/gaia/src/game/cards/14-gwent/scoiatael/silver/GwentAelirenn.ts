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

export default class GwentAelirenn extends ServerCard {
	public static readonly ELF_COUNT = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Aelirenn`,
				description: `If *${GwentAelirenn.ELF_COUNT}* Elf allies are on the board on any turn end, *Summon* this unit to a random row.`,
				flavor: `Better to die standing than to live on bent knee.`,
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.DECK])
			.require(() => game.board.getSplashableUnitsOfTribe(CardTribe.ELF, this.ownerGroup).length >= GwentAelirenn.ELF_COUNT)
			.requireImmediate(() => this.location === CardLocation.DECK)
			.requireImmediate(() => game.board.getControlledRows(this.ownerPlayer).some((row) => row.isNotFull()))
			.perform(() => {
				const allRows = game.board.getControlledRows(this.ownerPlayer).filter((row) => row.isNotFull())

				const randomRow = getRandomArrayValue(allRows)

				Keywords.summonUnitFromDeck({
					card: this,
					owner: this.ownerPlayer,
					rowIndex: randomRow.index,
					unitIndex: randomRow.farRightUnitIndex,
				})
			})
	}
}
