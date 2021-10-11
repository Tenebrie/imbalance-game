import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffProtector from '@src/game/buffs/BuffProtector'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import { asSplashUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroTagen extends ServerCard {
	public static readonly BASE_ENEMY_DAMAGE = 3
	private enemyDamage = asSplashUnitDamage(HeroTagen.BASE_ENEMY_DAMAGE)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
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
					target.dealDamage(ServerDamageInstance.fromCard(this.enemyDamage, this))
				})
			})
		})
	}
}
