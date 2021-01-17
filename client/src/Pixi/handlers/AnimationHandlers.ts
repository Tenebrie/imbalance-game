import AnimationMessage from '@shared/models/network/AnimationMessage'
import AnimationType from '@shared/enums/AnimationType'
import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardAnnounceAnimParams from '@shared/models/animations/CardAnnounceAnimParams'
import DelayAnimParams from '@shared/models/animations/DelayAnimParams'

export type AnimationHandlerResponse = {
	skip?: boolean
	extraDelay?: number
}

const handlers: { [index in AnimationType]: (AnimationMessage, any) => AnimationHandlerResponse | void } = {
	[AnimationType.NULL]: () => {
		// Empty
	},

	[AnimationType.DELAY]: (message: AnimationMessage, params: DelayAnimParams) => {
		return {
			extraDelay: params.delay,
		}
	},

	[AnimationType.CARD_DRAW]: () => {
		// Empty
	},

	[AnimationType.CARD_ANNOUNCE]: (message: AnimationMessage, params: CardAnnounceAnimParams) => {
		const cardMessage = params.cardMessage
		AudioSystem.playEffect(AudioEffectCategory.CARD_ANNOUNCE)
		const revealedCard = Core.opponent.cardHand.reveal(cardMessage)
		Core.mainHandler.announceCard(revealedCard)
	},

	[AnimationType.CARD_ATTACK]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createCardAttackProjectile(sourceCard, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.CARD_AFFECT]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createCardAffectProjectile(sourceCard, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.CARD_HEAL]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createCardHealProjectile(sourceCard, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.UNIVERSE_ATTACK]: (message: AnimationMessage) => {
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseAttackProjectile(targetCard)
		})
	},

	[AnimationType.UNIVERSE_AFFECT]: (message: AnimationMessage) => {
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseAffectProjectile(targetCard)
		})
	},

	[AnimationType.UNIVERSE_HEAL]: (message: AnimationMessage) => {
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			Core.mainHandler.projectileSystem.createUniverseHealProjectile(targetCard)
		})
	},

	[AnimationType.POST_CARD_ATTACK]: () => {
		// Empty
	},

	[AnimationType.UNIT_DEPLOY]: (message: AnimationMessage) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId)
		AudioSystem.playEffect(AudioEffectCategory.UNIT_DEPLOY)
		PIXI.Ticker.shared.addOnce(() => {
			PIXI.Ticker.shared.addOnce(() => {
				Core.particleSystem.createUnitDeployParticleEffect(targetUnit)
			})
		})
	},

	[AnimationType.UNIT_DESTROY]: (message: AnimationMessage) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId)
		Core.particleSystem.createUnitIncapacitateParticleEffect(targetUnit)
		targetUnit.fadeOut()
	},

	[AnimationType.UNIT_MOVE]: () => {
		AudioSystem.playEffect(AudioEffectCategory.CARD_MOVE)
	},

	[AnimationType.CARD_RECEIVED_BUFF]: (message: AnimationMessage, params: CardReceivedBuffAnimParams) => {
		let buffsReceived = 0
		message.targetCardIDs.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.particleSystem.createCardReceivedBuffParticleEffect(targetCard, params.alignment)
			const audioEffectCategory =
				params.alignment === BuffAlignment.NEGATIVE ? AudioEffectCategory.BUFF_NEGATIVE : AudioEffectCategory.BUFF_POSITIVE
			AudioSystem.playEffect(audioEffectCategory)
			buffsReceived += 1
		})
		return {
			skip: buffsReceived === 0,
		}
	},

	[AnimationType.CARD_INFUSE]: (message: AnimationMessage) => {
		const targetCard = Core.game.findRenderedCardById(message.targetCardId)
		Core.particleSystem.createInfuseParticleEffect(targetCard)
	},

	[AnimationType.CARD_GENERATE_MANA]: (message: AnimationMessage) => {
		const targetCard = Core.game.findRenderedCardById(message.targetCardId)
		Core.particleSystem.createManaGeneratedParticleEffect(targetCard)
	},
}

export default handlers
