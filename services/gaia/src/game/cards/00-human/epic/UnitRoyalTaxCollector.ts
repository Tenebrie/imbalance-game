import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffWeakness from '@src/game/buffs/BuffWeakness'
import SpellGoldTithe from '@src/game/cards/00-human/spells/SpellGoldTithe'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitRoyalTaxCollector extends ServerCard {
	private static readonly DEBUFF_POTENCY = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [SpellGoldTithe],
			stats: {
				power: 8,
				armor: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			debuffPotency: UnitRoyalTaxCollector.DEBUFF_POTENCY,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const alliedNobles = game.board
				.getUnitsOwnedByGroup(owner.group)
				.filter((unit) => unit.card.stats.power >= UnitRoyalTaxCollector.DEBUFF_POTENCY)
				.filter((unit) => unit.card !== this)
				.filter((unit) => unit.card.tribes.includes(CardTribe.NOBLE))
			alliedNobles.forEach((noble) => {
				game.animation.thread(() => {
					noble.buffs.addMultiple(BuffWeakness, UnitRoyalTaxCollector.DEBUFF_POTENCY, this)
					Keywords.addCardToHand.for(owner).fromConstructor(SpellGoldTithe)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
