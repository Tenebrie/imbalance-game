import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import { PlayerUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'
import OwnedCardRefMessage from '@shared/models/network/ownedCard/OwnedCardRefMessage'
import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import MulliganCountMessage from '@shared/models/network/MulliganCountMessage'
import PlayerInGameRefMessage from '@shared/models/network/playerInGame/PlayerInGameRefMessage'
import PlayerInGameManaMessage from '@shared/models/network/playerInGame/PlayerInGameManaMessage'

const IncomingPlayerUpdateMessages: { [index in PlayerUpdateMessageType]: IncomingMessageHandlerFunction } = {
	[PlayerUpdateMessageType.LEADER_SELF]: (data: CardMessage) => {
		if (Core.player.leader) {
			return
		}
		Core.player.leader = RenderedCard.fromMessage(data)
	},

	[PlayerUpdateMessageType.LEADER_OPPONENT]: (data: CardMessage) => {
		if (Core.opponent.leader) {
			return
		}
		Core.opponent.leader = RenderedCard.fromMessage(data)
	},

	[PlayerUpdateMessageType.MORALE]: (data: PlayerInGameManaMessage) => {
		Core.getPlayer(data.playerId).morale = data.morale
	},

	[PlayerUpdateMessageType.MANA]: (data: PlayerInGameManaMessage) => {
		Core.getPlayer(data.playerId).unitMana = data.unitMana
		Core.getPlayer(data.playerId).spellMana = data.spellMana
	},

	[PlayerUpdateMessageType.MULLIGANS]: (data: MulliganCountMessage) => {
		store.commit.gameStateModule.setCardsMulliganed(data.usedMulligans)
		store.commit.gameStateModule.setMaxCardMulligans(data.maxMulligans)
	},

	[PlayerUpdateMessageType.CARD_ADD_HAND_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardHand.addUnit(RenderedCard.fromMessage(data.card))
	},

	[PlayerUpdateMessageType.CARD_ADD_HAND_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardHand.addSpell(RenderedCard.fromMessage(data.card))
	},

	[PlayerUpdateMessageType.CARD_ADD_DECK_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardDeck.addUnit(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_DECK_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardDeck.addSpell(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardGraveyard.addUnit(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.playerId)
		player.cardGraveyard.addSpell(data.card)
	},

	[PlayerUpdateMessageType.CARD_DESTROY_IN_HAND]: (data: OwnedCardRefMessage) => {
		const player = Core.getPlayer(data.ownerId)

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.id === data.cardId) {
			Core.mainHandler.clearAnnouncedCard()
			player.cardHand.removeCardById(data.cardId)
		} else {
			player.cardHand.destroyCardById(data.cardId)
		}
	},

	[PlayerUpdateMessageType.CARD_DESTROY_IN_DECK]: (data: OwnedCardRefMessage) => {
		const player = Core.getPlayer(data.ownerId)
		player.cardDeck.destroyCardById(data.cardId)
	},

	[PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE]: (data: OwnedCardRefMessage) => {
		const player = Core.getPlayer(data.ownerId)
		player.cardGraveyard.destroyCardById(data.cardId)
	},

	[PlayerUpdateMessageType.PLAY_TARGETS]: (data: CardTargetMessage[]) => {
		Core.input.playableCards = data
		Core.input.updateGrabbedCard()
	},

	[PlayerUpdateMessageType.CARD_REVEALED]: (data: CardMessage) => {
		Core.opponent.cardHand.reveal(data)
		Core.opponent.cardHand.sortCards()
	},

	[PlayerUpdateMessageType.PLAY_DECLINED]: (data: CardRefMessage) => {
		console.info('Card play declined', data)
		const cardInLimbo = Core.input.restoreLimboCard(data)
		Core.player.cardHand.addCard(cardInLimbo)
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_SELF]: (data: CardTargetMessage[]) => {
		Core.board.validOrders = data
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT]: (data: CardTargetMessage[]) => {
		Core.board.validOpponentOrders = data
	},

	[PlayerUpdateMessageType.TURN_START]: (player: PlayerInGameRefMessage) => {
		Core.getPlayer(player.playerId).startTurn()
	},

	[PlayerUpdateMessageType.TURN_END]: (player: PlayerInGameRefMessage) => {
		Core.getPlayer(player.playerId).endTurn()
	},

	[PlayerUpdateMessageType.ROUND_START]: (player: PlayerInGameRefMessage) => {
		if (player.playerId === Core.player?.player.id) {
			store.commit.gameStateModule.setIsPlayerInRound(true)
		} else if (player.playerId === Core.opponent?.player.id) {
			store.commit.gameStateModule.setIsOpponentInRound(true)
		}
	},

	[PlayerUpdateMessageType.ROUND_END]: (player: PlayerInGameRefMessage) => {
		if (player.playerId === Core.player?.player.id) {
			store.commit.gameStateModule.setIsPlayerInRound(false)
		} else if (player.playerId === Core.opponent?.player.id) {
			store.commit.gameStateModule.setIsOpponentInRound(false)
		}
	},

	[PlayerUpdateMessageType.GAME_END_VICTORY]: () => {
		store.dispatch.gameStateModule.winGame()
	},

	[PlayerUpdateMessageType.GAME_END_DEFEAT]: () => {
		store.dispatch.gameStateModule.loseGame()
	},

	[PlayerUpdateMessageType.GAME_END_DRAW]: () => {
		store.dispatch.gameStateModule.drawGame()
	},
}

export default IncomingPlayerUpdateMessages
