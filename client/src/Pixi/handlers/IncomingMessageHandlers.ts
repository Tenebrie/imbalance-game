import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import CardMessage from '@/Pixi/shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import GameStartMessage from '@/Pixi/shared/models/GameStartMessage'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/Pixi/shared/models/network/CardOnBoardMessage'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import CardHandMessage from '@/Pixi/shared/models/network/CardHandMessage'
import CardDeckMessage from '@/Pixi/shared/models/network/CardDeckMessage'
import GameTimeMessage from '@/Pixi/shared/models/network/GameTimeMessage'
import HiddenCardMessage from '@/Pixi/shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@/Pixi/shared/models/network/PlayerInGameMessage'
import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import GameBoardMessage from '@/Pixi/shared/models/network/GameBoardMessage'
import GameBoardRowMessage from '@/Pixi/shared/models/network/GameBoardRowMessage'
import AnimationMessage from '@/Pixi/shared/models/network/AnimationMessage'
import AnimationType from '@/Pixi/shared/enums/AnimationType'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardTargetMessage from '@/Pixi/shared/models/network/CardTargetMessage'
import RenderedCard from '@/Pixi/board/RenderedCard'

const handlers: {[ index: string ]: any } = {
	'gameState/start': (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
		store.dispatch.gameStateModule.startGame()
	},

	'gameState/hand': (data: CardHandMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data)
	},

	'gameState/deck': (data: CardDeckMessage) => {
		Core.player.cardDeck = ClientCardDeck.fromMessage(data)
	},

	'gameState/player/self': (data: PlayerInGameMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data.cardHand)
		Core.player.cardDeck = ClientCardDeck.fromMessage(data.cardDeck)
		Core.player.morale = data.morale
		Core.player.setUnitMana(data.unitMana)
		Core.player.setSpellMana(data.spellMana)
	},

	'gameState/player/opponent': (data: PlayerInGameMessage) => {
		const playerInGame = ClientPlayerInGame.fromMessage(data)
		Core.registerOpponent(playerInGame)
		store.commit.gameStateModule.setOpponentData(playerInGame.player)
	},

	'gameState/board': (data: GameBoardMessage) => {
		data.rows.forEach(row => {
			Core.board.rows[row.index].setOwner(Core.getPlayer(row.ownerId))
		})
	},

	'gameState/units': (data: CardOnBoardMessage[]) => {
		Core.board.clearBoard()
		data.forEach(message => {
			const card = RenderedCardOnBoard.fromMessage(message)
			Core.board.insertUnit(card, message.rowIndex, message.unitIndex)
		})
	},

	'update/board/unitOrders': (data: CardTargetMessage[]) => {
		Core.board.validOrders = data.map(message => ClientCardTarget.fromMessage(message))
	},

	'update/board/opponentOrders': (data: CardTargetMessage[]) => {
		Core.board.validOpponentOrders = data.map(message => ClientCardTarget.fromMessage(message))
	},

	'update/game/phase': (data: GameTurnPhase) => {
		Core.game.setTurnPhase(data)
	},

	'update/game/time': (data: GameTimeMessage) => {
		Core.game.currentTime = data.currentTime
		Core.game.maximumTime = data.maximumTime
	},

	'update/board/unitCreated': (data: CardOnBoardMessage) => {
		if (Core.board.findUnitById(data.card.id)) { return }

		Core.input.clearCardInLimbo(data.card)
		Core.board.unitsOnHold.push(RenderedCardOnBoard.fromMessage(data))
	},

	'update/board/unitInserted': (data: CardOnBoardMessage) => {
		if (Core.board.findInsertedById(data.card.id)) { return }

		Core.board.insertUnitFromHold(data.card.id, data.rowIndex, data.unitIndex)
	},

	'update/board/unitMoved': (data: CardOnBoardMessage) => {
		const unit = Core.board.findUnitById(data.card.id)
		if (!unit) { return }

		Core.board.removeUnit(unit)
		Core.board.insertUnit(unit, data.rowIndex, data.unitIndex)
	},

	'update/board/unitDestroyed': (data: CardMessage) => {
		const unit = Core.board.findUnitById(data.id)
		if (!unit) { return }

		Core.board.destroyUnit(unit)
	},

	'update/board/row/owner': (data: GameBoardRowMessage) => {
		Core.board.rows[data.index].setOwner(Core.getPlayerOrNull(data.ownerId))
	},

	'update/board/card/power': (data: CardMessage) => {
		const cardOnBoard = Core.board.findUnitById(data.id)
		if (!cardOnBoard) { return }
		if (typeof (data.power) === 'undefined') {
			console.warn(`Trying to set card ${data.id} power to undefined value!`)
			return
		}

		cardOnBoard.setPower(data.power)
	},

	'update/player/self/turnStarted': (data: void) => {
		Core.player.startTurn()
	},

	'update/player/opponent/turnStarted': (data: void) => {
		Core.opponent.startTurn()
	},

	'update/player/self/turnEnded': (data: void) => {
		Core.player.endTurn()
	},

	'update/player/opponent/turnEnded': (data: void) => {
		Core.opponent.endTurn()
	},

	'update/player/self/morale': (data: PlayerInGameMessage) => {
		Core.player.morale = data.morale
	},

	'update/player/opponent/morale': (data: PlayerInGameMessage) => {
		Core.opponent.morale = data.morale
	},

	'update/player/self/unitMana': (data: PlayerInGameMessage) => {
		Core.player.setUnitMana(data.unitMana)
	},

	'update/player/opponent/unitMana': (data: PlayerInGameMessage) => {
		Core.opponent.setUnitMana(data.unitMana)
	},

	'update/player/self/spellMana': (data: PlayerInGameMessage) => {
		Core.player.setSpellMana(data.spellMana)
	},

	'update/player/opponent/spellMana': (data: PlayerInGameMessage) => {
		Core.opponent.setSpellMana(data.spellMana)
	},

	'update/player/self/victory': (data: PlayerInGameMessage) => {
		store.dispatch.gameStateModule.winGame()
	},

	'update/player/self/defeat': (data: PlayerInGameMessage) => {
		store.dispatch.gameStateModule.loseGame()
	},

	'update/player/self/draw': (data: PlayerInGameMessage) => {
		store.dispatch.gameStateModule.drawGame()
	},

	'update/player/self/hand/playDeclined': (data: CardMessage) => {
		console.info('Card play declined', data)
		const cardInLimbo = Core.input.restoreCardFromLimbo(data)
		Core.player.cardHand.addCard(cardInLimbo)
	},

	'update/player/self/hand/unit/cardDrawn': (data: CardMessage[]) => {
		console.info('Units drawn', data)
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawUnitById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addUnit(card)
			}
		})
	},

	'update/player/opponent/hand/unit/cardDrawn': (data: HiddenCardMessage[]) => {
		console.info('Opponent units', data)
		data.forEach(cardMessage => {
			const card = Core.opponent.cardDeck.drawUnitById(cardMessage.id)
			if (card) {
				Core.opponent.cardHand.addUnit(card)
			}
		})
	},

	'update/player/self/hand/unit/cardAdded': (data: CardMessage) => {
		Core.player.cardHand.addUnit(RenderedCard.fromMessage(data))
	},

	'update/player/self/hand/spell/cardAdded': (data: CardMessage) => {
		Core.player.cardHand.addSpell(RenderedCard.fromMessage(data))
	},

	'update/player/opponent/hand/unit/cardAdded': (data: CardMessage) => {
		Core.opponent.cardHand.addUnit(RenderedCard.fromMessage(data))
	},

	'update/player/opponent/hand/spell/cardAdded': (data: CardMessage) => {
		Core.opponent.cardHand.addSpell(RenderedCard.fromMessage(data))
	},

	'update/player/self/hand/spell/cardDrawn': (data: CardMessage[]) => {
		console.info('Spells drawn', data)
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawSpellById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addSpell(card)
			}
		})
	},

	'update/player/opponent/hand/spell/cardDrawn': (data: HiddenCardMessage[]) => {
		console.info('Opponent spells', data)
		data.forEach(cardMessage => {
			const card = Core.opponent.cardDeck.drawSpellById(cardMessage.id)
			if (card) {
				Core.opponent.cardHand.addSpell(card)
			}
		})
	},

	'update/player/opponent/hand/cardRevealed': (data: CardMessage) => {
		Core.opponent.cardHand.reveal(data)
	},

	'update/player/self/hand/cardDestroyed': (data: CardMessage) => {
		Core.player.cardHand.destroyCardById(data.id)
	},

	'update/player/opponent/hand/cardDestroyed': (data: CardMessage) => {
		const card = Core.opponent.cardHand.findCardById(data.id)
		if (!card) { return }

		if (Core.mainHandler.announcedCard === card) {
			Core.mainHandler.clearAnnouncedCard()
		}
		Core.opponent.cardHand.destroyCard(card)
	},

	'update/player/self/hand/playTargets': (data: CardTargetMessage[]) => {
		Core.input.playableCards = data.map(data => ClientCardTarget.fromMessage(data))
	},

	'update/player/self/graveyard/cardAdded': (data: CardMessage) => {
		Core.player.cardGraveyard.addUnit(data)
	},

	'update/player/opponent/graveyard/cardAdded': (data: CardMessage) => {
		Core.opponent.cardGraveyard.addUnit(data)
	},

	'update/stack/cardResolving': (data: CardMessage) => {
		Core.resolveStack.addCard(RenderedCard.fromMessage(data))
	},

	'update/stack/cardTargets': (data: CardTargetMessage[]) => {
		const validTargets = data.map(data => ClientCardTarget.fromMessage(data))
		Core.input.enableForcedTargetingMode(validTargets)
	},

	'update/stack/cardResolved': (data: CardMessage) => {
		Core.resolveStack.destroyCardById(data.id)
		if (Core.resolveStack.isEmpty()) {
			Core.input.disableForcedTargetingMode()
		}
	},

	'animation/generic': (data: AnimationMessage) => {
		let animationDuration = 500

		if (data.type === AnimationType.CARD_PLAY) {
			const announcedCard = Core.opponent.cardHand.findCardById(data.targetCardID)!
			Core.mainHandler.announceCard(announcedCard)
			animationDuration = 3000
		} else if (data.type === AnimationType.UNIT_ATTACK) {
			animationDuration = 300
			const sourceUnit = Core.board.findUnitById(data.sourceUnitID)
			data.targetUnitIDs.forEach(targetUnitID => {
				const targetUnit = Core.board.findUnitById(targetUnitID)
				Core.mainHandler.projectileSystem.createUnitAttackProjectile(sourceUnit, targetUnit)
			})
		} else if (data.type === AnimationType.POST_UNIT_ATTACK) {
			animationDuration = 100
		} else if (data.type === AnimationType.ALL_UNITS_MOVE) {
			animationDuration = 750
		}
		Core.mainHandler.triggerAnimation(animationDuration)
	},

	'command/disconnect': (data: void) => {
		store.dispatch.leaveGame()
	},

	'error/generic': (data: string) => {
		console.error('Server error:', data)
	}
}

export default handlers
