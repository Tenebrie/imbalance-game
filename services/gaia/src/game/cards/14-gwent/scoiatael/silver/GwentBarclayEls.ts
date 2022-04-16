import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentBarclayEls extends ServerCard {
	protected static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF, CardTribe.OFFICER],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentBarclayEls.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Barclay Els',
				description: 'Play a random Bronze or Silver Dwarf from your deck and Strengthen it by {boost}.',
				flavor: "Our mead smells rotten to ye, do it? Easy to fix – I'll break yer nose!",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards
				.filter((card) => card.tribes.includes(CardTribe.DWARF))
				.filter((card) => card.color === CardColor.BRONZE || card.color === CardColor.SILVER)

			const cardToPlay = getRandomArrayValue(validCards)

			if (!cardToPlay) {
				return
			}

			Keywords.playCardFromDeck(cardToPlay)

			cardToPlay.buffs.addMultiple(BuffBaseStrength, GwentBarclayEls.BOOST, this)
		})
	}
}
