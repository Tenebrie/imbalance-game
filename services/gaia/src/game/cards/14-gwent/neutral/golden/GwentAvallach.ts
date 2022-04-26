import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { isTruce } from '@src/utils/Utils'

export default class GwentAvallach extends ServerCard {
	public static readonly CARDS_TO_DRAW = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.ELF, CardTribe.DOOMED],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Avallac'h`,
				description: `*Truce*: Each player draws *${GwentAvallach.CARDS_TO_DRAW}* cards.`,
				flavor: `You humans have… unusual tastes.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => isTruce(game))
			.perform(() => {
				game.allPlayers.forEach((player) => {
					game.animation.instantThread(() => {
						for (let i = 0; i < GwentAvallach.CARDS_TO_DRAW; i++) {
							Keywords.draw.topUnitCard(player)
						}
					})
				})
			})
	}
}
