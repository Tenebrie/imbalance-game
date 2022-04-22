import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentMilaen extends ServerCard {
	public static readonly DAMAGE = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF],
			stats: {
				power: 4,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Milaen`,
				description: `Deal *${GwentMilaen.DAMAGE}* damage to the units at the end of a row.`,
				flavor: `The old baron treated poachers mercilessly. Luckily for Milaen, the old baron was dead and his men, desperate outlaws.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				if (targetRow.cards.length === 0) {
					return
				}

				targetRow.cards[0].dealDamage(DamageInstance.fromCard(GwentMilaen.DAMAGE, this))

				if (targetRow.cards.length === 1) {
					return
				}

				targetRow.cards[targetRow.cards.length - 1].dealDamage(DamageInstance.fromCard(GwentMilaen.DAMAGE, this))
			})
	}
}
