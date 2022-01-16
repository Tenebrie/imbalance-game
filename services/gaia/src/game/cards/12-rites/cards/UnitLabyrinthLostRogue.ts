import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asSplashUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitLabyrinthLostRogue extends ServerCard {
	damage = asSplashUnitDamage(8)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST],
			features: [CardFeature.SPY],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
			adjacentUnits.forEach((unit) => {
				this.game.animation.createInstantAnimationThread()
				unit.dealDamage(DamageInstance.fromCard(this.damage, this))
				this.game.animation.commitAnimationThread()
			})
		})
	}
}
