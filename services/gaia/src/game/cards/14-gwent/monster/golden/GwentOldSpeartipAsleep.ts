import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentOldSpeartipAsleep extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentOldSpeartipAsleep.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Old Speartip: Asleep',
				description: '*Strengthen* all your other Ogroids in hand, deck, and on board by {boost}.',
				flavor: 'Do not disturb.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const targets = owner.cardHand.allCards
				.concat(owner.cardDeck.allCards)
				.concat(game.board.getSplashableUnitsFor(owner.group).map((unit) => unit.card))
				.filter((card) => card.tribes.includes(CardTribe.OGROID))
				.filter((card) => card !== this)

			targets.forEach((card) => {
				game.animation.thread(() => {
					card.buffs.addMultiple(BuffBaseStrength, GwentOldSpeartipAsleep.BOOST, this)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
