import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentGeraltAard extends ServerCard {
	public static readonly DAMAGE = 3
	public static readonly TARGETS = 3

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
				name: `Geralt: Aard`,
				description: `Deal *${GwentGeraltAard.DAMAGE}* damage to *${GwentGeraltAard.TARGETS}* enemies and move them to the row above.`,
				flavor: `A blast of concentrated energy that pummels everything in its path. Great for when you forget your keys.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(GwentGeraltAard.TARGETS)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentGeraltAard.DAMAGE, this), 'stagger')
				if (targetUnit.isDead) {
					return
				}
				game.animation.thread(() => {
					game.board.moveUnitBack(targetUnit, 1)
				})
			})
	}
}
