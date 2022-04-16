import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentOldSpeartip extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly TARGETS = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentOldSpeartip.DAMAGE,
			targets: GwentOldSpeartip.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Old Speartip',
				description: 'Deal {damage} damage to {targets} random enemies on the opposite row.',
				flavor: "Oh, you're in a heap of trouble now…",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const oppositeRow = game.board.getOppositeRow(triggeringUnit.rowIndex)

			const targets = getMultipleRandomArrayValues(oppositeRow.cards, GwentOldSpeartip.TARGETS)

			targets.forEach((card) => {
				game.animation.thread(() => {
					card.dealDamage(DamageInstance.fromCard(GwentOldSpeartip.DAMAGE, this))
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
