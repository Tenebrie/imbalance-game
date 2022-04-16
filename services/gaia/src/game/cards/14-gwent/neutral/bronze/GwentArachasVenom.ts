import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentArachasVenom extends ServerCard {
	public static readonly DAMAGE = 4
	public static readonly TARGETS = 3

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
			damage: GwentArachasVenom.DAMAGE,
			targets: GwentArachasVenom.TARGETS,
		}

		this.createLocalization({
			en: {
				name: "Aracha's Venom",
				description: 'Deal {damage} damage to {targets} adjacent units.',
				flavor: 'If substance makes contact with eyes, rinse immediately with cold water, then commence drawing up will.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(targetUnit)
				const targets = [targetUnit].concat(adjacentUnits)
				targets.forEach((target) => {
					game.animation.thread(() => {
						target.dealDamage(DamageInstance.fromCard(GwentArachasVenom.DAMAGE, this))
					})
				})
			})
	}
}
