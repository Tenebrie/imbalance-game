import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import BuffWeakness from '@src/game/buffs/BuffWeakness'
import Keywords from '@src/utils/Keywords'
import SpellGoldTithe from '@src/game/cards/00-human/spells/SpellGoldTithe'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitRoyalTaxCollector extends ServerCard {
	private static readonly DEBUFF_POTENCY = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [SpellGoldTithe],
			stats: {
				power: 4,
				armor: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			debuffPotency: UnitRoyalTaxCollector.DEBUFF_POTENCY,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const alliedNobles = game.board
				.getUnitsOwnedByPlayer(this.owner)
				.filter((unit) => unit.card.stats.power >= UnitRoyalTaxCollector.DEBUFF_POTENCY)
				.filter((unit) => unit.card !== this)
				.filter((unit) => unit.card.tribes.includes(CardTribe.NOBLE))
			alliedNobles.forEach((noble) => {
				game.animation.thread(() => {
					noble.buffs.addMultiple(BuffWeakness, UnitRoyalTaxCollector.DEBUFF_POTENCY, this)
					Keywords.addCardToHand.forOwnerOf(this).fromConstructor(SpellGoldTithe)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
