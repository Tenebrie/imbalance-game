import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffProtector from '@src/game/buffs/BuffProtector'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { asSplashUnitDamage } from '@src/utils/LeaderStats'

export default class HeroTagen extends ServerCard {
	public static readonly BASE_ENEMY_DAMAGE = 3
	private enemyDamage = asSplashUnitDamage(HeroTagen.BASE_ENEMY_DAMAGE)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 6,
				armor: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.enemyDamage,
		}

		this.buffs.add(BuffProtector, this)

		this.createLocalization({
			en: {
				name: 'Tagen',
				title: 'The Flamey Lad',
				description: '*Deploy:*<br>Deal {damage} Damage to ALL opposing enemy units.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const opposingUnits = this.game.board.getOpposingUnits(triggeringUnit)
			opposingUnits.forEach((target) => {
				game.animation.thread(() => {
					target.dealDamage(DamageInstance.fromCard(this.enemyDamage, this))
				})
			})
		})
	}
}
