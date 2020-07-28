import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import CardMessage from '@shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import UnitMessage from '@shared/models/network/UnitMessage'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import CardHandMessage from '@shared/models/network/CardHandMessage'
import CardDeckMessage from '@shared/models/network/CardDeckMessage'
import GameTimeMessage from '@shared/models/network/GameTimeMessage'
import HiddenCardMessage from '@shared/models/network/HiddenCardMessage'
import PlayerInGameMessage from '@shared/models/network/PlayerInGameMessage'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import BoardMessage from '@shared/models/network/BoardMessage'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import AnimationHandlers from './AnimationHandlers'
import BuffMessage from '@shared/models/network/BuffMessage'
import ClientBuff from '@/Pixi/models/ClientBuff'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'

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

	'gameState/board': (data: BoardMessage) => {
		data.rows.forEach(row => {
			Core.board.rows[row.index].setOwner(Core.getPlayer(row.ownerId))
		})
	},

	'gameState/units': (data: UnitMessage[]) => {
		Core.board.clearBoard()
		data.forEach(message => {
			const card = RenderedUnit.fromMessage(message)
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

	'update/board/unitCreated': (data: UnitMessage) => {
		if (Core.board.findUnitById(data.card.id)) { return }

		Core.input.clearCardInLimbo(data.card)
		Core.board.unitsOnHold.push(RenderedUnit.fromMessage(data))
	},

	'update/board/unitInserted': (data: UnitMessage) => {
		if (Core.board.findInsertedById(data.card.id)) { return }

		Core.board.insertUnitFromHold(data.card.id, data.rowIndex, data.unitIndex)
	},

	'update/board/unitMoved': (data: UnitMessage) => {
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

	'update/board/row/owner': (data: BoardRowMessage) => {
		Core.board.rows[data.index].setOwner(Core.getPlayerOrNull(data.ownerId))
	},

	'update/card/power': (data: CardMessage) => {
		const card = Core.game.findRenderedCardById(data.id)
		if (!card) { return }
		if (typeof (data.power) === 'undefined') {
			console.warn(`Trying to set card ${data.id} power to undefined value!`)
			return
		}

		card.setPower(data.power)
	},

	'update/card/armor': (data: CardMessage) => {
		const card = Core.game.findRenderedCardById(data.id)
		if (!card) { return }
		if (typeof (data.armor) === 'undefined') {
			console.warn(`Trying to set card ${data.id} power to undefined value!`)
			return
		}

		card.setArmor(data.armor)
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
		data.forEach(cardMessage => {
			const card = Core.player.cardDeck.drawUnitById(cardMessage.id)
			if (card) {
				Core.player.cardHand.addUnit(card)
			}
		})
	},

	'update/player/opponent/hand/unit/cardDrawn': (data: HiddenCardMessage[]) => {
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

	'update/player/self/deck/unit/cardAdded': (data: CardMessage) => {
		Core.player.cardDeck.addUnit(data)
	},

	'update/player/self/deck/spell/cardAdded': (data: CardMessage) => {
		Core.player.cardDeck.addSpell(data)
	},

	'update/player/opponent/deck/unit/cardAdded': (data: CardMessage) => {
		Core.opponent.cardDeck.addUnit(data)
	},

	'update/player/opponent/deck/spell/cardAdded': (data: CardMessage) => {
		Core.opponent.cardDeck.addSpell(data)
	},

	'update/player/self/graveyard/unit/cardAdded': (data: CardMessage) => {
		Core.player.cardGraveyard.addUnit(data)
	},

	'update/player/self/graveyard/spell/cardAdded': (data: CardMessage) => {
		Core.player.cardGraveyard.addSpell(data)
	},

	'update/player/opponent/graveyard/unit/cardAdded': (data: CardMessage) => {
		Core.opponent.cardGraveyard.addUnit(data)
	},

	'update/player/opponent/graveyard/spell/cardAdded': (data: CardMessage) => {
		Core.opponent.cardGraveyard.addSpell(data)
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

	'update/player/self/deck/cardDestroyed': (data: CardMessage) => {
		Core.player.cardDeck.removeCardById(data.id)
	},

	'update/player/opponent/deck/cardDestroyed': (data: CardMessage) => {
		Core.opponent.cardDeck.removeCardById(data.id)
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

	'update/card/variables': (data: CardVariablesMessage[]) => {
		data.forEach(message => {
			const matchingCard = Core.game.findRenderedCardById(message.cardId) || Core.board.findUnitById(message.cardId).card
			if (!matchingCard) {
				return
			}
			matchingCard.setCardVariables(message.cardVariables)
		})
	},

	'update/card/buffs/added': (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.add(new ClientBuff(data))
	},

	'update/card/buffs/intensityChanged': (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.findBuffById(data.id).intensity = data.intensity
	},

	'update/card/buffs/durationChanged': (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.findBuffById(data.id).duration = data.duration
	},

	'update/card/buffs/removed': (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.remove(data)
	},

	'update/log/entry': (data: EventLogEntryMessage[]) => {
		store.dispatch.gameLogModule.addEntryGroup({
			entries: data
		})
	},

	'animation/generic': (data: AnimationMessage) => {
		const handler = AnimationHandlers[data.type]
		if (!handler) {
			console.error(`Unknown animation type ${data.type}`)
			return
		}

		const animationDuration = handler(data, data.params)
		Core.mainHandler.triggerAnimation(animationDuration)
	},

	'system/requestInit': (data: void) => {
		if (Core.isReady) {
			OutgoingMessageHandlers.sendInit()
		}
	},

	'command/disconnect': (data: void) => {
		store.dispatch.leaveGame()
	},

	'error/generic': (data: string) => {
		console.error('Server error:', data)
	}
}

export default handlers
