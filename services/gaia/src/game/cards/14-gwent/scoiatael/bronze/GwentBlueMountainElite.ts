import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentBlueMountainElite extends ServerCard {
	public static readonly BONUS_POWER = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			power: GwentBlueMountainElite.BONUS_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Blue Mountain Elite',
				description: '*Summon* all copies of this unit to this row. Whenever this unit moves, boost it by {power}.',
				flavor: "By the time we'd heard them, it was already too late…",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner, triggeringUnit }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card instanceof GwentBlueMountainElite)
			if (validCards.length === 0) {
				return
			}
			validCards.forEach((card, index) => {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({ card, owner, rowIndex: triggeringUnit.rowIndex, unitIndex: triggeringUnit.unitIndex + index + 1 })
				})
			})

			game.animation.syncAnimationThreads()
		})

		this.createEffect(GameEventType.UNIT_MOVED).perform(({ triggeringUnit }) => {
			triggeringUnit.buffs.addMultiple(BuffStrength, GwentBlueMountainElite.BONUS_POWER, this)
		})
	}
}
