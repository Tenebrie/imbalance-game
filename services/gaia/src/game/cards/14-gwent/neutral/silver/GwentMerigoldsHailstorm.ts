import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentMerigoldsHailstorm extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: "Merigold's Hailstorm",
				description: 'Halve the power of all Bronze and Silver units on a row.',
				flavor:
					"The sky dimmed of a sudden, and clouds amassed over the town. It grew fiendishly dark, and a cold gust swept in. Oh my, gasped Yennefer. We're about to make quite the mess, I think.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW).perform(({ targetRow }) => {
			const targets = targetRow.splashableCards
				.filter((unit) => [CardColor.BRONZE, CardColor.SILVER].includes(unit.card.color))
				.filter((unit) => unit.stats.power > 1)
				.sort((a, b) => a.unitIndex - b.unitIndex)
			targets.forEach((unit) => {
				unit.dealDamage(DamageInstance.fromCard(Math.floor(unit.stats.power / 2), this), 'stagger')
			})
		})
	}
}
