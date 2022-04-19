import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentDimeritiumBomb extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Dimeritium Bomb',
				description: `Reset all boosted units on a row.`,
				flavor: `An important part of every Witch Hunter's kit. In one muted flash, it turns the most powerful sorcerer into pork jelly ripe for cutting.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(({ targetRow }) => targetRow.targetableCards.length > 0)
			.perform(({ targetRow }) => {
				const targets = targetRow.targetableCards.filter((unit) => unit.stats.power > unit.stats.basePower)
				targets.forEach((target) => {
					game.animation.thread(() => {
						Keywords.resetUnit(target)
					})
				})
			})
	}
}
