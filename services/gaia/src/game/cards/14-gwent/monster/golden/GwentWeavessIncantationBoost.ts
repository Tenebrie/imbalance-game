import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import GwentWeavessIncantation from './GwentWeavessIncantation'

export default class GwentWeavessIncantationBoost extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			boost: GwentWeavessIncantationBoost.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Hexing Incantation',
				description: '*Strengthen* all your other Relicts in hand, deck, and on board by {boost}.',
				flavor: 'Raise, my pretties, raise stronger than ever before!',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const weavess = game.board.getUnitsOwnedByPlayer(owner).find((unit) => unit.card instanceof GwentWeavessIncantation)?.card

			const targets = owner.cardHand.allCards
				.concat(owner.cardDeck.allCards)
				.concat(game.board.getUnitsOwnedByGroup(owner.group).map((unit) => unit.card))
				.filter((card) => card.tribes.includes(CardTribe.RELICT))
				.filter((card) => card !== weavess)

			targets.forEach((card) => {
				game.animation.thread(() => {
					card.buffs.addMultiple(BuffBaseStrength, GwentWeavessIncantationBoost.BOOST, this)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
