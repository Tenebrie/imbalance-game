import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDennisCranmer extends ServerCard {
	protected static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF, CardTribe.OFFICER],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentDennisCranmer.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Dennis Cranmer',
				description: '*Strengthen* all your other Dwarves in hand, deck, and on board by {boost}.',
				flavor: 'I know how to execute orders, so take your advice somewhere else.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const dennis = game.board.getSplashableUnitsFor(owner).find((unit) => unit.card instanceof GwentDennisCranmer)?.card

			const targets = owner.cardHand.allCards
				.concat(owner.cardDeck.allCards)
				.concat(game.board.getSplashableUnitsFor(owner.group).map((unit) => unit.card))
				.filter((card) => card.tribes.includes(CardTribe.DWARF))
				.filter((card) => card !== dennis)

			targets.forEach((card) => {
				game.animation.thread(() => {
					card.buffs.addMultiple(BuffBaseStrength, GwentDennisCranmer.BOOST, this)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
