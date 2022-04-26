import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentWardancer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 3,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Wardancer`,
				description: `Whenever you *Swap* this unit, play it automatically on a random row.`,
				flavor: `You mean to say the she–elf danced amidst the fray? Have you lost your mind, corporal?!`,
			},
		})

		this.createEffect(GameEventType.CARD_RETURNED).perform(({ owner }) => {
			const allRows = game.board.getControlledRows(owner).filter((row) => row.isNotFull())

			if (allRows.length === 0) {
				return
			}

			const randomRow = getRandomArrayValue(allRows)
			if (!randomRow) {
				return
			}

			Keywords.summonUnitFromDeck({ card: this, owner, rowIndex: randomRow.index, unitIndex: randomRow.farRightUnitIndex })
		})
	}
}
