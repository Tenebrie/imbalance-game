import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentDoomed from '@src/game/buffs/14-gwent/BuffGwentDoomed'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentHalfElfHunter extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Half-Elf Hunter`,
				description: `*Spawn* a Doomed default copy of this unit to the right of this unit.`,
				flavor: `Hated by men, reviled by elves and always picked last during schoolyard games. No wonder half-elves tend to have a chip on their shoulder.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const summonedCopy = Keywords.summonUnit({
				owner,
				cardConstructor: GwentHalfElfHunter,
				rowIndex: triggeringUnit.boardRow.index,
				unitIndex: triggeringUnit.boardRow.farRightUnitIndex,
			})

			summonedCopy?.card.buffs.add(BuffGwentDoomed, this)
		})
	}
}
