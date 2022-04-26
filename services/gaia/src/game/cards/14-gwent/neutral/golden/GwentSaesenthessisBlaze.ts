import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentSaesenthessisBlaze extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.AEDIRN, CardTribe.DRACONID],
			stats: {
				power: 11,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Saesenthessis: Blaze`,
				description: `*Banish* your hand and draw that many cards.`,
				flavor: `I inherited my father's ability to assume other forms - well, one other form, in my case.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			owner.cardHand.allCards.forEach((card) => {
				game.animation.instantThread(() => {
					owner.cardHand.removeCard(card)
					Keywords.draw.topUnitCard(owner)
				})
			})
		})
	}
}
