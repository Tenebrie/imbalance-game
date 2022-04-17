import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getConstructorFromBuff } from '@src/utils/Utils'

export default class GwentSpores extends ServerCard {
	public static readonly DAMAGE = 2

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
			damage: GwentSpores.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Spores',
				description: 'Deal {damage} damage to all units on a row and clear a *Boon* from it.',
				flavor: 'Eat enough of them, and the world will never be the same…',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				const targets = targetRow.cards.sort((a, b) => a.unitIndex - b.unitIndex)
				targets.forEach((unit) => {
					game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromCard(GwentSpores.DAMAGE, this))
					})
				})
				game.animation.syncAnimationThreads()

				const boon = targetRow.buffs.buffs.find((buff) => buff.alignment === BuffAlignment.POSITIVE)
				if (boon) {
					targetRow.buffs.removeAll(getConstructorFromBuff(boon), this)
				}
			})
	}
}
