import AnimationType from '@shared/enums/AnimationType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardAnnounceAnimParams from '@shared/models/animations/CardAnnounceAnimParams'
import CardReceivedBuffAnimParams from '@shared/models/animations/CardReceivedBuffAnimParams'
import DelayAnimParams from '@shared/models/animations/DelayAnimParams'
import RowReceivedBuffAnimParams from '@shared/models/animations/RowReceivedBuffAnimParams'
import UnitDestroyedWithAffectAnimParams from '@shared/models/animations/UnitDestroyedWithAffectAnimParams'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import * as PIXI from 'pixi.js'

import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { getAnimDurationMod } from '@/utils/Utils'

export type AnimationHandlerResponse = {
	skip?: boolean
	extraDelay?: number
}

const handlers: { [index in AnimationType]: (message: AnimationMessage, params: any) => AnimationHandlerResponse | void } = {
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
		const playerWithCard = Core.allPlayers.find((player) => player.cardHand.allCards.find((card) => card.id === message.targetCardId))

		let revealedCard
		if (playerWithCard) {
			revealedCard = playerWithCard.cardHand.reveal(cardMessage)!
		} else {
			revealedCard = RenderedCard.fromMessage(cardMessage)
		}
		Core.mainHandler.announceCard(revealedCard)
	},

	[AnimationType.CARD_ANNOUNCE_CLEAR]: () => {
		Core.mainHandler.clearAnnouncedCard()
	},

	[AnimationType.CARD_ATTACK]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId!)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
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

	[AnimationType.ROW_ATTACK]: (message: AnimationMessage) => {
		const sourceRow = Core.board.getRow(message.sourceRowIndex!)
		if (!sourceRow) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createRowAttackCardProjectile(sourceRow, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.CARD_AFFECT]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId!)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
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
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId!)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
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

	[AnimationType.CARD_AFFECTS_ROWS]: (message: AnimationMessage) => {
		const sourceCard = Core.game.findRenderedCardById(message.sourceCardId!)
		if (!sourceCard) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetRowIndices!.forEach((targetRowIndex) => {
			const targetRow = Core.board.getRow(targetRowIndex)
			if (!targetRow) {
				return
			}
			Core.mainHandler.projectileSystem.createCardAffectsRowProjectile(sourceCard, targetRow)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.ROW_AFFECTS_CARDS]: (message: AnimationMessage) => {
		const sourceRow = Core.board.getRow(message.sourceRowIndex!)
		if (!sourceRow) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createRowAffectCardProjectile(sourceRow, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.ROW_HEALS_CARDS]: (message: AnimationMessage) => {
		const sourceRow = Core.board.getRow(message.sourceRowIndex!)
		if (!sourceRow) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createRowHealProjectile(sourceRow, targetCard)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.ROW_AFFECTS_ROWS]: (message: AnimationMessage) => {
		const sourceRow = Core.board.getRow(message.sourceRowIndex!)
		if (!sourceRow) {
			return { skip: true }
		}
		let projectilesSpawned = 0
		message.targetRowIndices!.forEach((targetRowIndex) => {
			const targetRow = Core.board.getRow(targetRowIndex)
			if (!targetRow) {
				return
			}
			Core.mainHandler.projectileSystem.createRowAffectRowProjectile(sourceRow, targetRow)
			projectilesSpawned += 1
		})
		return {
			skip: projectilesSpawned === 0,
		}
	},

	[AnimationType.UNIVERSE_ATTACK]: (message: AnimationMessage) => {
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createUniverseAttackProjectile(targetCard)
		})
	},

	[AnimationType.UNIVERSE_AFFECT]: (message: AnimationMessage) => {
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createUniverseAffectProjectile(targetCard)
		})
	},

	[AnimationType.UNIVERSE_HEAL]: (message: AnimationMessage) => {
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.mainHandler.projectileSystem.createUniverseHealProjectile(targetCard)
		})
	},

	[AnimationType.POST_CARD_ATTACK]: () => {
		// Empty
	},

	[AnimationType.UNIT_DEPLOY]: (message: AnimationMessage) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId!)
		AudioSystem.playEffect(AudioEffectCategory.UNIT_DEPLOY)
		if (!targetUnit) {
			return
		}
		PIXI.Ticker.shared.addOnce(() => {
			PIXI.Ticker.shared.addOnce(() => {
				Core.particleSystem.createUnitDeployParticleEffect(targetUnit)
			})
		})
	},

	[AnimationType.UNIT_DESTROY]: (message: AnimationMessage) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId!)
		if (!targetUnit) {
			return
		}
		Core.particleSystem.createUnitIncapacitateParticleEffect(targetUnit)
		targetUnit.fadeOut()
	},

	[AnimationType.UNIT_DESTROY_WITH_AFFECT]: (message: AnimationMessage, params: UnitDestroyedWithAffectAnimParams) => {
		const targetUnit = Core.board.findUnitById(message.targetCardId!)
		if (!targetUnit) {
			return
		}
		Core.particleSystem.createUnitIncapacitateParticleEffect(targetUnit)
		params.affectedCardIDs.forEach((affectedCardId) => {
			const affectedCard = Core.game.findRenderedCardById(affectedCardId)
			if (!affectedCard) {
				return
			}
			Core.mainHandler.projectileSystem.createCardAffectProjectile(targetUnit.card, affectedCard)
		})
		targetUnit.fadeOut()
	},

	[AnimationType.UNIT_MOVE]: () => {
		AudioSystem.playEffect(AudioEffectCategory.CARD_MOVE)
	},

	[AnimationType.CARD_RECEIVED_BUFF]: (message: AnimationMessage, params: CardReceivedBuffAnimParams) => {
		let buffsReceived = 0
		message.targetCardIDs!.forEach((targetCardId) => {
			const targetCard = Core.game.findRenderedCardById(targetCardId)
			if (!targetCard) {
				return
			}
			Core.particleSystem.createCardReceivedBuffParticleEffect(targetCard, params.alignment)

			targetCard.cardTintOverlay.tint = params.alignment === BuffAlignment.NEGATIVE ? 0xff0000 : 0x00ff00
			targetCard.cardTintOverlay.alpha = 1

			const audioEffectCategory =
				params.alignment === BuffAlignment.NEGATIVE ? AudioEffectCategory.BUFF_NEGATIVE : AudioEffectCategory.BUFF_POSITIVE
			AudioSystem.playEffect(audioEffectCategory)
			buffsReceived += 1
		})
		return {
			skip: buffsReceived === 0,
		}
	},

	[AnimationType.ROWS_RECEIVED_BUFF]: (message: AnimationMessage, params: RowReceivedBuffAnimParams) => {
		let buffsReceived = 0
		message.targetRowIndices!.forEach((targetRowIndex) => {
			const targetRow = Core.board.getRow(targetRowIndex)
			if (!targetRow) {
				return
			}
			Core.particleSystem.createRowBuffCreateParticleEffect(targetRow, params.alignment)

			const audioEffectCategory =
				params.alignment === BuffAlignment.NEGATIVE ? AudioEffectCategory.BUFF_NEGATIVE : AudioEffectCategory.BUFF_POSITIVE
			AudioSystem.playEffect(audioEffectCategory)
			buffsReceived += 1
		})
		return {
			skip: buffsReceived === 0,
		}
	},

	[AnimationType.CARDS_LOST_BUFF]: () => {
		/* Empty */
		return {
			skip: true,
		}
	},

	[AnimationType.ROWS_LOST_BUFF]: (message: AnimationMessage, params: RowReceivedBuffAnimParams) => {
		let buffsLost = 0
		message.targetRowIndices!.forEach((targetRowIndex) => {
			const targetRow = Core.board.getRow(targetRowIndex)
			if (!targetRow) {
				return
			}
			Core.particleSystem.createRowBuffCreateParticleEffect(targetRow, params.alignment)
			buffsLost += 1
		})
		return {
			skip: buffsLost === 0,
		}
	},

	[AnimationType.CARD_INFUSE]: (message: AnimationMessage) => {
		const targetCard = Core.game.findRenderedCardById(message.targetCardId!)
		if (!targetCard) {
			return
		}
		Core.particleSystem.createInfuseParticleEffect(targetCard)
	},

	[AnimationType.CARD_GENERATE_MANA]: (message: AnimationMessage) => {
		const targetCard = Core.game.findRenderedCardById(message.targetCardId!)
		if (!targetCard) {
			return
		}
		Core.particleSystem.createManaGeneratedParticleEffect(targetCard)
		targetCard.cardTintOverlay.tint = 0x0000ff
		targetCard.cardTintOverlay.alpha = 1
	},

	[AnimationType.SWITCHING_GAMES]: () => {
		return {
			extraDelay: 1000 / getAnimDurationMod(),
		}
	},
}

export default handlers
