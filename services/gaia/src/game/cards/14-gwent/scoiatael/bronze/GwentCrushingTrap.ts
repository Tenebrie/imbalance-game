import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentCrushingTrap extends ServerCard {
	public static readonly DAMAGE = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Crushing Trap`,
				description: `Deal *${GwentCrushingTrap.DAMAGE}* damage to the units at the end of an enemy row.`,
				flavor: `When this knocks you down, you don't get up again.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				if (targetRow.cards.length === 0) {
					return
				}

				targetRow.cards[0].dealDamage(DamageInstance.fromCard(GwentCrushingTrap.DAMAGE, this))

				if (targetRow.cards.length === 1) {
					return
				}

				targetRow.cards[targetRow.cards.length - 1].dealDamage(DamageInstance.fromCard(GwentCrushingTrap.DAMAGE, this))
			})
	}
}
