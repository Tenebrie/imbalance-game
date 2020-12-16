import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import {PlayerUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'
import CardType from '@shared/enums/CardType'
import OwnedCardRefMessage from '@shared/models/network/ownedCard/OwnedCardRefMessage'
import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import MulliganCountMessage from '@shared/models/network/MulliganCountMessage'
import CardFeature from '@shared/enums/CardFeature'

const IncomingPlayerUpdateMessages: {[ index in PlayerUpdateMessageType ]: IncomingMessageHandlerFunction } = {
	[PlayerUpdateMessageType.LEADER_SELF]: (data: CardMessage) => {
		Core.player.leader = new RenderedCard(data)
	},

	[PlayerUpdateMessageType.LEADER_OPPONENT]: (data: CardMessage) => {
		Core.opponent.leader = new RenderedCard(data)
	},

	[PlayerUpdateMessageType.MORALE]: (data: PlayerInGameMessage) => {
		Core.getPlayer(data.player.id).morale = data.morale
	},

	[PlayerUpdateMessageType.MANA]: (data: PlayerInGameMessage) => {
		Core.getPlayer(data.player.id).setUnitMana(data.unitMana)
		Core.getPlayer(data.player.id).setSpellMana(data.spellMana)
	},

	[PlayerUpdateMessageType.MULLIGANS]: (data: MulliganCountMessage) => {
		store.commit.gameStateModule.setCardsMulliganed(data.usedMulligans)
		store.commit.gameStateModule.setMaxCardMulligans(data.maxMulligans)
	},

	[PlayerUpdateMessageType.CARD_ADD_HAND_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardHand.addUnit(RenderedCard.fromMessage(data.card))
	},

	[PlayerUpdateMessageType.CARD_ADD_HAND_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardHand.addSpell(RenderedCard.fromMessage(data.card))
	},

	[PlayerUpdateMessageType.CARD_ADD_DECK_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardDeck.addUnit(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_DECK_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardDeck.addSpell(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardGraveyard.addUnit(data.card)
	},

	[PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL]: (data: OwnedCardMessage) => {
		const player = Core.getPlayer(data.owner.player.id)
		player.cardGraveyard.addSpell(data.card)
	},

	[PlayerUpdateMessageType.CARD_DESTROY_IN_HAND]: (data: OwnedCardRefMessage) => {
		const player = Core.getPlayer(data.ownerId)
		player.cardHand.destroyCardById(data.cardId)

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.id === data.cardId) {
			Core.mainHandler.clearAnnouncedCard()
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
		Core.input.playableCards = data.map(data => ClientCardTarget.fromMessage(data))
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
		Core.board.validOrders = data.map(message => ClientCardTarget.fromMessage(message))
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT]: (data: CardTargetMessage[]) => {
		Core.board.validOpponentOrders = data.map(message => ClientCardTarget.fromMessage(message))
	},

	[PlayerUpdateMessageType.TURN_START]: (player: PlayerInGameMessage) => {
		Core.getPlayer(player.player.id).startTurn()
	},

	[PlayerUpdateMessageType.TURN_END]: (player: PlayerInGameMessage) => {
		Core.getPlayer(player.player.id).endTurn()
	},

	[PlayerUpdateMessageType.ROUND_START]: (player: PlayerInGameMessage) => {
		console.warn(`${player.player.username} has started their round, but it was not properly handled!`)
	},

	[PlayerUpdateMessageType.ROUND_END]: (player: PlayerInGameMessage) => {
		console.warn(`${player.player.username} has ended their round, but it was not properly handled!`)
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
