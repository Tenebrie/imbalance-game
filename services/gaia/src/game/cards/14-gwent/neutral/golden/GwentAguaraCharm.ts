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

import GwentAguara from './GwentAguara'

export default class GwentAguaraCharm extends ServerCard {
	public static readonly MAX_POWER = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Aguara's Call`,
				description: `*Charm* a random enemy Elf with *${GwentAguaraCharm.MAX_POWER}* power or less.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const validUnits = game.board
				.getSplashableUnitsForOpponentOf(this)
				.filter((unit) => unit.card.tribes.includes(CardTribe.ELF))
				.filter((unit) => unit.stats.power <= GwentAguaraCharm.MAX_POWER)
			const target = getRandomArrayValue(validUnits)
			if (target === null) {
				return
			}

			const aguara = game.board.getAllUnitsFor(this).find((unit) => unit.card instanceof GwentAguara)
			if (!aguara) {
				return
			}

			const targetRow = aguara.boardRow
			if (targetRow.isFull()) {
				return
			}

			Keywords.charmUnit(target, targetRow, aguara.unitIndex, owner)
		})
	}
}
