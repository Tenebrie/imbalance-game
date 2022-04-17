import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentLacerate extends ServerCard {
	public static readonly DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentLacerate.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Lacerate',
				description: 'Deal {damage} damage to all units on a row.',
				flavor:
					"A sight more horrid you've never seen… The poor soul lay shredded as the beast lapped up its blood from the ground all around.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				const targets = targetRow.cards.sort((a, b) => a.unitIndex - b.unitIndex)
				targets.forEach((unit) => {
					game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromCard(GwentLacerate.DAMAGE, this))
					})
				})
				game.animation.syncAnimationThreads()
			})
	}
}
