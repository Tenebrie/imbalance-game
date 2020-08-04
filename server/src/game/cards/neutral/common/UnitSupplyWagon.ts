import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ServerAnimation from '../../../models/ServerAnimation'
import {mapUnitsToCards} from '../../../../utils/Utils'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class UnitSupplyWagon extends ServerCard {
	extraPower = 3
	pushDistance = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 4
		this.dynamicTextVariables = {
			extraPower: this.extraPower,
			pushDistance: this.pushDistance
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		let adjacentUnits = this.game.board.getAdjacentUnits(this.unit)
		this.game.animation.play(ServerAnimation.cardAffectsCards(this, mapUnitsToCards(adjacentUnits)))
		adjacentUnits.forEach(unit => {
			unit.buffs.addMultiple(BuffStrength, this.extraPower, this)
		})
		this.game.animation.play(ServerAnimation.cardReceivedBuff(mapUnitsToCards(adjacentUnits), BuffAlignment.POSITIVE))
		adjacentUnits = adjacentUnits.filter(unit => unit.isAlive())
		if (adjacentUnits.length === 0) {
			return
		}

		adjacentUnits.forEach(unit => {
			this.game.board.moveUnitForward(unit, this.pushDistance)
		})
		this.game.animation.play(ServerAnimation.unitMove())
	}
}
