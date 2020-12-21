import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import {asMassUnitDamage} from '../../../../utils/LeaderStats'
import ServerDamageInstance from '../../../models/ServerDamageSource'

export default class UnitQuietInfiltrator extends ServerCard {
	damage = asMassUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.SPY],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
		adjacentUnits.forEach(unit => {
			this.game.animation.createInstantAnimationThread()
			unit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
			this.game.animation.commitAnimationThread()
		})
		// adjacentUnits = adjacentUnits.filter(unit => unit.isAlive())
		// if (adjacentUnits.length === 0) {
		// 	return
		// }
		//
		// this.game.animation.syncAnimationThreads()
		// adjacentUnits.forEach(unit => {
		// 	this.game.animation.createInstantAnimationThread()
		// 	this.game.board.moveUnitForward(unit, this.pushDistance)
		// 	this.game.animation.commitAnimationThread()
		// })
		// this.game.animation.play(ServerAnimation.unitMove())
	}
}
