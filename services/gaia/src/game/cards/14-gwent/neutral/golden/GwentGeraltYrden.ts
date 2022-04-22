import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentGeraltYrden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Geralt: Yrden`,
				description: `*Reset* all units on a row.`,
				flavor: `He lay down next to Adda's mummified remains, drawing the Yrden Sign on the inner side of her sarcophagus' lid.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW).perform(({ targetRow }) => {
			const targets = targetRow.splashableCards
			targets.forEach((target) => {
				game.animation.thread(() => {
					Keywords.resetUnit(target)
				})
			})
		})
	}
}
