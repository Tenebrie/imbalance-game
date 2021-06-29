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
import PlayerInGameManaMessage from '@shared/models/network/playerInGame/PlayerInGameManaMessage'
import GameLinkMessage from '@shared/models/network/GameLinkMessage'
import PlayerGroupResourcesMessage from '@shared/models/network/playerInGame/PlayerGroupResourcesMessage'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'

const IncomingPlayerUpdateMessages: { [index in PlayerUpdateMessageType]: IncomingMessageHandlerFunction } = {
	[PlayerUpdateMessageType.LEADERS]: (data: OwnedCardMessage[]) => {
		data.forEach((message) => {
			const targetPlayer = Core.allPlayers.find((player) => player.player.id === message.owner.playerId)
			if (!targetPlayer) {
				throw new Error(`Unable to find player with id ${message.owner.playerId}`)
			}
			targetPlayer.leader = RenderedCard.fromMessage(message.card)
		})
	},

	[PlayerUpdateMessageType.MORALE]: (data: PlayerGroupResourcesMessage) => {
		Core.getPlayerGroup(data.playerGroupId).roundWins = data.roundWins
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
		const playerWithCard = Core.opponent.players.find((player) => player.cardHand.allCards.find((card) => card.id === data.id))
		if (!playerWithCard) {
			return
		}
		playerWithCard.cardHand.reveal(data)
		playerWithCard.cardHand.sortCards()
	},

	[PlayerUpdateMessageType.PLAY_DECLINED]: (data: CardRefMessage) => {
		console.info('Card play declined', data)
		const cardInLimbo = Core.input.restoreLimboCard(data)
		if (!cardInLimbo) {
			return
		}
		Core.player.players[0].cardHand.addCard(cardInLimbo)
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_SELF]: (data: CardTargetMessage[]) => {
		Core.board.validOrders = data
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT]: (data: CardTargetMessage[]) => {
		Core.board.validOpponentOrders = data
	},

	[PlayerUpdateMessageType.TURN_START]: (group: PlayerGroupRefMessage) => {
		Core.getPlayerGroup(group.id).startTurn()
	},

	[PlayerUpdateMessageType.TURN_END]: (group: PlayerGroupRefMessage) => {
		Core.getPlayerGroup(group.id).endTurn()
	},

	[PlayerUpdateMessageType.ROUND_START]: (group: PlayerGroupRefMessage) => {
		if (group.id === Core.player.id) {
			store.commit.gameStateModule.setIsPlayerInRound(true)
		} else if (group.id === Core.opponent.id) {
			store.commit.gameStateModule.setIsOpponentInRound(true)
		}
	},

	[PlayerUpdateMessageType.ROUND_END]: (group: PlayerGroupRefMessage) => {
		if (group.id === Core.player.id) {
			store.commit.gameStateModule.setIsPlayerInRound(false)
		} else if (group.id === Core.opponent.id) {
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

	[PlayerUpdateMessageType.LINKED_GAME]: (data: GameLinkMessage) => {
		store.commit.setNextLinkedGame(data.game)
		store.commit.gameStateModule.setEndScreenSuppressed(data.suppressEndScreen)
	},

	[PlayerUpdateMessageType.COMMAND_JOIN_LINKED_GAME]: () => {
		store.dispatch.leaveAndContinue()
	},
}

export default IncomingPlayerUpdateMessages
