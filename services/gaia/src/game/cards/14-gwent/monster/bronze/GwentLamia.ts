import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentLamia extends ServerCard {
	private static readonly DAMAGE = 4
	private static readonly BLOOD_MOON_DAMAGE = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentLamia.DAMAGE,
			bloodMoonDamage: GwentLamia.BLOOD_MOON_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Lamia',
				description: 'Deal {damage} damage to an enemy. If the enemy is under *Blood Moon*, deal {bloodMoonDamage} damage instead.',
				flavor:
					"The fool paid heed to superstition, stuffed his ears with wax and didn't hear the warnings. He ran his ship straight into the rocks.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const hasBloodMoon = game.board.rows[targetUnit.rowIndex].buffs.has(BuffRowBloodMoon)
				const damage = hasBloodMoon ? GwentLamia.BLOOD_MOON_DAMAGE : GwentLamia.DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})
	}
}
