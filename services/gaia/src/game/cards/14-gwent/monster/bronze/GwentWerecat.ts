import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentBloodMoon from '@src/game/buffs/14-gwent/BuffGwentBloodMoon'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentWerecat extends ServerCard {
	public static readonly TARGET_DAMAGE = 5
	public static readonly BLOOD_MOON_DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST, CardTribe.CURSED],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.dynamicTextVariables = {
			targetDamage: GwentWerecat.TARGET_DAMAGE,
			bloodMoonDamage: GwentWerecat.BLOOD_MOON_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Werecat',
				description: 'Deal {targetDamage} damage to an enemy, then deal {bloodMoonDamage} damage to all enemies under *Blood Moon*.',
				flavor: 'He hates it when you scratch his belly.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.owner !== this.ownerGroup)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentWerecat.TARGET_DAMAGE, this))

				const enemiesUnderMoon = game.board
					.getSplashableUnitsForOpponentOf(this)
					.filter((unit) => game.board.rows[unit.rowIndex].buffs.has(BuffGwentBloodMoon))

				enemiesUnderMoon.forEach((unit) => {
					game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromCard(GwentWerecat.TARGET_DAMAGE, this))
					})
				})
				game.animation.syncAnimationThreads()
			})
	}
}
