import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'

export default class UnitSupplyWagon extends ServerCard {
	extraPower = asSplashBuffPotency(6)
	pushDistance = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_DEPLOY],
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
