import AnimationMessage from '@shared/models/network/AnimationMessage'
import AnimationType from '@shared/enums/AnimationType'
import Core from '@/Pixi/Core'
import UnitAttackAnimParams from '@shared/models/animations/UnitAttackAnimParams'

const handlers: {[ index: number ]: (AnimationMessage, any) => number } = {
	[AnimationType.DELAY]: (message: AnimationMessage, params: void) => {
		return 500
	},

	[AnimationType.CARD_PLAY]: (message: AnimationMessage, params: void) => {
		const announcedCard = Core.opponent.cardHand.findCardById(message.targetCardID)!
		Core.mainHandler.announceCard(announcedCard)
		return 2000
	},

	[AnimationType.UNIT_ATTACK]: (message: AnimationMessage, params: UnitAttackAnimParams) => {
		const sourceUnit = Core.board.findUnitById(message.sourceUnitID)
		const damage = params.damage
		message.targetUnitIDs.forEach(targetUnitID => {
			const targetUnit = Core.board.findUnitById(targetUnitID)
			Core.mainHandler.projectileSystem.createUnitAttackProjectile(sourceUnit, targetUnit, damage)
		})
		return 500
	},

	[AnimationType.POST_UNIT_ATTACK]: (message: AnimationMessage, params: void) => {
		return 100
	},

	[AnimationType.ALL_UNITS_MOVE]: (message: AnimationMessage, params: void) => {
		return 750
	}
}

export default handlers
