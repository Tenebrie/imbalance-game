import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerAnimation from '../../../models/ServerAnimation'

export default class UnitSupplyWagon extends ServerCard {
	extraPower = asSplashBuffPotency(6)
	pushDistance = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			extraPower: this.extraPower,
			pushDistance: this.pushDistance,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		let adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
		adjacentUnits.forEach((unit) => {
			this.game.animation.createInstantAnimationThread()
			unit.buffs.addMultiple(BuffStrength, this.extraPower, this)
			this.game.animation.commitAnimationThread()
		})
		adjacentUnits = adjacentUnits.filter((unit) => unit.isAlive())
		if (adjacentUnits.length === 0) {
			return
		}

		this.game.animation.syncAnimationThreads()
		adjacentUnits.forEach((unit) => {
			this.game.animation.createInstantAnimationThread()
			this.game.board.moveUnitForward(unit, this.pushDistance)
			this.game.animation.commitAnimationThread()
		})
		this.game.animation.play(ServerAnimation.unitMove())
	}
}
