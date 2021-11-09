import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class HeroFormidiaShade extends ServerCard {
	public rememberedCards: CardConstructor[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			tribes: [CardTribe.DRAGON],
			faction: CardFaction.ARCANE,
			features: [CardFeature.QUICK],
			stats: {
				power: 0,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			showInfo: () => !!this.ownerGroupNullable && !this.unit,
			cardsRemembered: () => this.rememberedCards.length,
		}

		this.createLocalization({
			en: {
				name: 'Shade of Formidia',
				description: '*Deploy:*<br>*Summon* a copy of every remembered unit.<if showInfo><p><i>Units remembered: {cardsRemembered}.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.rememberedCards.forEach((card) => {
				const rows = game.board
					.getControlledRows(this.ownerGroup)
					.filter((row) => !row.isFull())
					.sort((a, b) => game.board.getDistanceToStaticFront(a.index) - game.board.getDistanceToStaticFront(b.index))
				if (rows.length === 0) {
					return
				}
				const targetRow = rows[0]
				game.animation.thread(() => {
					Keywords.summonUnit({
						owner: this.ownerPlayer,
						cardConstructor: card,
						rowIndex: targetRow.index,
						unitIndex: targetRow.cards.length,
					})
				})
			})
			this.rememberedCards = []
		})
	}
}
0
