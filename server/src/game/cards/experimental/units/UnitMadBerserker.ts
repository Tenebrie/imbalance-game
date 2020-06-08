import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitMadBerserker extends ServerCard {
	hasAttackedThisTurn = false
	lastAttackTarget: ServerUnit | null = null
	consecutiveAttackCount = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 54
		this.baseAttack = 3
	}

	onTurnEnded(): void {
		if (!this.hasAttackedThisTurn) {
			this.lastAttackTarget = null
			this.consecutiveAttackCount = 0
		}
		this.hasAttackedThisTurn = false
	}

	onBeforePerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit): void {
		this.hasAttackedThisTurn = true
		if (target === this.lastAttackTarget) {
			this.consecutiveAttackCount += 1
		} else {
			this.lastAttackTarget = target
			this.consecutiveAttackCount = 0
		}
	}

	getBonusAttackDamage(thisUnit: ServerUnit, target: ServerUnit): number {
		return this.consecutiveAttackCount * 3
	}
}
