import CardMessage from '@shared/models/network/card/CardMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import GameLinkMessage from '@shared/models/network/GameLinkMessage'
import { PlayerUpdateMessageHandlers, PlayerUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import MulliganCountMessage from '@shared/models/network/MulliganCountMessage'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'
import OwnedCardRefMessage from '@shared/models/network/ownedCard/OwnedCardRefMessage'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'
import PlayerGroupResourcesMessage from '@shared/models/network/playerInGame/PlayerGroupResourcesMessage'
import PlayerInGameManaMessage from '@shared/models/network/playerInGame/PlayerInGameManaMessage'
import gsap from 'gsap'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'
import store from '@/Vue/store'

const IncomingPlayerUpdateMessages: PlayerUpdateMessageHandlers = {
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
		const targetCard = player.cardHand.findCardById(data.cardId)
		if (!targetCard) {
			return
		}

		if (
			(Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.id === data.cardId) ||
			(Core.mainHandler.previousAnnouncedCard && Core.mainHandler.previousAnnouncedCard.id === data.cardId)
		) {
			player.cardHand.removeCardById(data.cardId)
		} else if (player.group === Core.opponent) {
			player.cardHand.destroyCard(targetCard)
		} else {
			player.cardHand.removeCardById(data.cardId)

			gsap.to(targetCard.coreContainer, {
				duration: 0.5,
				overwrite: true,
				pixi: {
					alpha: 0,
					positionY: targetCard.coreContainer.position.y - 150 * getRenderScale().superSamplingLevel,
				},
			})
			setTimeout(() => {
				Core.destroyCard(targetCard)
			}, 1000)
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

	[PlayerUpdateMessageType.UNIT_ORDERS_SELF]: (data: CardTargetMessage[]) => {
		Core.board.validOrders = data
	},

	[PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT]: (data: CardTargetMessage[]) => {
		Core.board.validOpponentOrders = data
	},

	[PlayerUpdateMessageType.CARD_REVEALED]: (data: CardMessage) => {
		const playerWithCardInHand = Core.opponent.players.find((player) => player.cardHand.allCards.find((card) => card.id === data.id))
		if (playerWithCardInHand) {
			playerWithCardInHand.cardHand.reveal(data)
			playerWithCardInHand.cardHand.sortCards()
			return
		}
		const cardOnBoard = Core.board.findUnitById(data.id)
		if (cardOnBoard) {
			Core.board.revealUnit(cardOnBoard, data)
			return
		}
		console.error(`Trying to reveal unit with ID '${data.id}', but it can't be found.`)
	},

	[PlayerUpdateMessageType.PLAY_DECLINED]: (data: CardRefMessage) => {
		console.info('Card play declined', data)
		const cardInLimbo = Core.input.restoreLimboCard(data)
		if (!cardInLimbo) {
			return
		}
		Core.player.players[0].cardHand.addCard(cardInLimbo)
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

	[PlayerUpdateMessageType.SUPPRESS_END_SCREEN]: () => {
		store.commit.gameStateModule.setEndScreenSuppressed(true)
	},

	[PlayerUpdateMessageType.LINKED_GAME]: (data: GameLinkMessage) => {
		store.commit.setNextLinkedGame(data.game)
	},

	[PlayerUpdateMessageType.COMMAND_JOIN_LINKED_GAME]: () => {
		store.dispatch.leaveAndContinue()
	},
}

export default IncomingPlayerUpdateMessages
