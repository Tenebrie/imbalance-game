import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import {asMassUnitDamage} from '../../../../utils/LeaderStats'

export default class UnitEnergyRelay extends ServerCard {
	infuseCost = 1
	damageDealt = asMassUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_INFUSE_X],
			stats: {
				power: 7
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			damageDealt: this.damageDealt,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => Keywords.infuse(this, this.infuseCost))
			.perform(() => this.onDealDamage())
	}

	private onDealDamage(): void {
		const triggeringUnit = this.unit!
		const opposingEnemies = this.game.board.getUnitsOwnedByOpponent(this.owner)
			.filter(unit => this.game.board.getHorizontalUnitDistance(unit, triggeringUnit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, triggeringUnit) - this.game.board.getVerticalUnitDistance(b, triggeringUnit)
			})

		if (opposingEnemies.length === 0) {
			return
		}

		const shortestDistance = this.game.board.getVerticalUnitDistance(opposingEnemies[0], triggeringUnit)
		const targets = opposingEnemies.filter(unit => this.game.board.getVerticalUnitDistance(unit, triggeringUnit) === shortestDistance)

		targets.forEach(unit => {
			this.game.animation.createInstantAnimationThread()
			unit.dealDamage(ServerDamageInstance.fromUnit(this.damageDealt, triggeringUnit))
			this.game.animation.commitAnimationThread()
		})
	}
}
