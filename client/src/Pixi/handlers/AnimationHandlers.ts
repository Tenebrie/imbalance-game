import AnimationMessage from '@shared/models/network/AnimationMessage'
import AnimationType from '@shared/enums/AnimationType'
import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardAnnounceAnimParams from '@shared/models/animations/CardAnnounceAnimParams'

const handlers: {[ index: number ]: (AnimationMessage, any) => number } = {
	[AnimationType.DELAY]: (message: AnimationMessage, params: void) => {
		return 500
	},

	[AnimationType.CARD_DRAW]: (message: AnimationMessage, params: void) => {
		return 1000
	},

	[AnimationType.CARD_ANNOUNCE]: (message: AnimationMessage, params: CardAnnounceAnimParams) => {
		const cardMessage = params.cardMessage
		AudioSystem.playEffect(AudioEffectCategory.CARD_ANNOUNCE)
		const revealedCard = Core.opponent.cardHand.reveal(cardMessage)
		Core.mainHandler.announceCard(revealedCard)
		return 2000
	},

	[AnimationType.CARD_ATTACK]: (message: AnimationMessage, params: void) => {
		const animationDuration = 500
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (sourceCard) {
			message.targetCardIDs.forEach(targetCardId => {
				const targetCard = Core.game.findRenderedCardById(targetCardId)
				if (!targetCard) {
					console.warn(`Target card with id ${targetCardId} does not exist!`)
					return animationDuration
				}
				Core.mainHandler.projectileSystem.createCardAttackProjectile(sourceCard, targetCard)
			})
		}
		return animationDuration
	},

	[AnimationType.CARD_AFFECT]: (message: AnimationMessage, params: void) => {
		const animationDuration = 500
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (sourceCard) {
			message.targetCardIDs.forEach(targetCardId => {
				const targetCard = Core.game.findRenderedCardById(targetCardId)
				if (!targetCard) {
					console.warn(`Target card with id ${targetCardId} does not exist!`)
					return animationDuration
				}
				Core.mainHandler.projectileSystem.createCardAffectProjectile(sourceCard, targetCard)
			})
		}
		return animationDuration
	},

	[AnimationType.CARD_HEAL]: (message: AnimationMessage, params: void) => {
		const animationDuration = 500
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (sourceCard) {
			message.targetCardIDs.forEach(targetCardId => {
				const targetCard = Core.game.findRenderedCardById(targetCardId)
				if (!targetCard) {
					console.warn(`Target card with id ${targetCardId} does not exist!`)
					return animationDuration
				}
				Core.mainHandler.projectileSystem.createCardHealProjectile(sourceCard, targetCard)
			})
		}
		return animationDuration
	},

	[AnimationType.UNIVERSE_ATTACK]: (message: AnimationMessage, params: void) => {
		message.targetCardIDs.forEach(targetCardId => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseAttackProjectile(targetCard)
		})
		return 500
	},

	[AnimationType.UNIVERSE_AFFECT]: (message: AnimationMessage, params: void) => {
		message.targetCardIDs.forEach(targetCardId => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseAffectProjectile(targetCard)
		})
		return 500
	},

	[AnimationType.UNIVERSE_HEAL]: (message: AnimationMessage, params: void) => {
		message.targetCardIDs.forEach(targetCardId => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseHealProjectile(targetCard)
		})
		return 500
	},

	[AnimationType.POST_CARD_ATTACK]: (message: AnimationMessage, params: void) => {
		return 100
	},

	[AnimationType.UNIT_DEPLOY]: (message: AnimationMessage, params: void) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId)
		AudioSystem.playEffect(AudioEffectCategory.UNIT_DEPLOY)
		PIXI.Ticker.shared.addOnce(() => {
			PIXI.Ticker.shared.addOnce(() => {
				Core.particleSystem.createUnitDeployParticleEffect(targetUnit)
			})
		})
		return 500
	},

	[AnimationType.UNIT_MOVE]: (message: AnimationMessage, params: void) => {
		AudioSystem.playEffect(AudioEffectCategory.CARD_MOVE)
		return 750
	},

	[AnimationType.CARD_RECEIVED_BUFF]: (message: AnimationMessage, params: CardReceivedBuffAnimParams) => {
		message.targetCardIDs.forEach(targetCardId => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.particleSystem.createCardReceivedBuffParticleEffect(targetCard, params.alignment)
			const audioEffectCategory = params.alignment === BuffAlignment.NEGATIVE ? AudioEffectCategory.BUFF_NEGATIVE : AudioEffectCategory.BUFF_POSITIVE
			AudioSystem.playEffect(audioEffectCategory)
		})
		return 500
	},
}

export default handlers
