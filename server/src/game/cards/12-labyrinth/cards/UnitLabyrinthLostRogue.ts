import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashUnitDamage } from '@src/utils/LeaderStats'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitLabyrinthLostRogue extends ServerCard {
	damage = asSplashUnitDamage(8)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.SPY],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
			adjacentUnits.forEach((unit) => {
				this.game.animation.createInstantAnimationThread()
				unit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
				this.game.animation.commitAnimationThread()
			})
		})
	}
}
