import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentLesserDao from '../tokens/GwentLesserDao'

export default class GwentDao extends ServerCard {
	public static readonly SUMMON_COUNT = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CONSTRUCT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			summonCount: GwentDao.SUMMON_COUNT,
		}

		this.createLocalization({
			en: {
				name: "D'ao",
				description: "*Deathwish:*\n*Spawn* {summonCount} *Lesser D'ao* on this row.",
				flavor: "How do you fight an earth elemental? You don't. You run. Fast as you can.",
			},
		})

		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(({ owner, rowIndex, unitIndex }) => {
				Keywords.summonMultipleUnits({
					owner,
					rowIndex,
					unitIndex,
					count: GwentDao.SUMMON_COUNT,
					cardConstructor: GwentLesserDao,
				})
			})
	}
}
