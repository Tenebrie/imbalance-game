import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroFormidiaShade from '@src/game/cards/01-arcane/legendary/Formidia/HeroFormidiaShade'
import Keywords from '@src/utils/Keywords'
import { getConstructorFromCard } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class HeroFormidia extends ServerCard {
	private shadeCard: HeroFormidiaShade | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			tribes: CardTribe.DRAGON,
			faction: CardFaction.ARCANE,
			stats: {
				power: 99,
			},
			relatedCards: [HeroFormidiaShade],
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			cardsRemembered: () => (this.shadeCard ? this.shadeCard.rememberedCards.length : 0),
		}

		this.createLocalization({
			en: {
				name: 'Formidia',
				title: 'The Returned',
				description: '*Deploy:*<br>Add *Shade of Formidia* into your hand.<p>Whenever any other unit is destroyed, remember it.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.shadeCard = Keywords.addCardToHand.forOwnerOf(this).fromConstructor(HeroFormidiaShade) as HeroFormidiaShade
		})

		this.createCallback(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card !== this)
			.perform(({ triggeringUnit }) => {
				this.shadeCard!.rememberedCards.push(getConstructorFromCard(triggeringUnit.card))
			})
	}
}
