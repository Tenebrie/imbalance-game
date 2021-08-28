import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerGame from '../../models/ServerGame'
import ServerCard from '../../models/ServerCard'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { isCardPublic } from '@src/utils/Utils'
import { PlayerUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OwnedCardRefMessage from '@shared/models/network/ownedCard/OwnedCardRefMessage'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'
import HiddenOwnedCardMessage from '@shared/models/network/ownedCard/HiddenOwnedCardMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import MulliganCountMessage from '@shared/models/network/MulliganCountMessage'
import PlayerInGameManaMessage from '@shared/models/network/playerInGame/PlayerInGameManaMessage'
import GameLinkMessage from '@shared/models/network/GameLinkMessage'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import PlayerGroupResourcesMessage from '@shared/models/network/playerInGame/PlayerGroupResourcesMessage'
import PlayerGroupRefMessage from '@shared/models/network/playerGroup/PlayerGroupRefMessage'

export default {
	notifyAboutRoundWins: (playerGroup: ServerPlayerGroup): void => {
		playerGroup.game.allPlayers.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.MORALE,
				data: new PlayerGroupResourcesMessage(playerGroup),
			})
		)
	},

	notifyAboutManaChange: (playerInGame: ServerPlayerInGame, delta: number): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.MANA,
			data: new PlayerInGameManaMessage(playerInGame),
			highPriority: delta < 0,
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.MANA,
					data: new PlayerInGameManaMessage(playerInGame),
				})
			)
		}
	},

	notifyAboutCardsMulliganed: (playerToNotify: ServerPlayer, playerInGame: ServerPlayerInGame): void => {
		playerToNotify.sendMessage({
			type: PlayerUpdateMessageType.MULLIGANS,
			data: new MulliganCountMessage(playerInGame.cardsMulliganed, playerInGame.game.maxMulligans),
			highPriority: true,
		})
	},

	notifyAboutCardAddedToUnitHand(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_HAND_UNIT,
					data: isCardPublic(card)
						? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
						: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardAddedToSpellHand(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_HAND_SPELL,
					data: isCardPublic(card)
						? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
						: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardAddedToUnitDeck(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_DECK_UNIT,
					data: isCardPublic(card)
						? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
						: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardAddedToSpellDeck(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_DECK_SPELL,
					data: isCardPublic(card)
						? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
						: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardAddedToUnitGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT,
					data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardAddedToSpellGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		const opponentGroup = playerInGame.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL,
					data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
				})
			)
		}
	},

	notifyAboutCardInHandDestroyed(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player

		owner.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_HAND,
			data: new OwnedCardRefMessage(ownedCard),
		})

		const opponentGroup = ownedCard.owner.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_DESTROY_IN_HAND,
					data: new OwnedCardRefMessage(ownedCard),
				})
			)
		}
	},

	notifyAboutCardInDeckDestroyed(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player

		owner.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_DECK,
			data: new OwnedCardRefMessage(ownedCard),
		})

		const opponentGroup = ownedCard.owner.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_DESTROY_IN_DECK,
					data: new OwnedCardRefMessage(ownedCard),
				})
			)
		}
	},

	notifyAboutCardInGraveyardDestroyed(ownedCard: ServerOwnedCard): void {
		ownedCard.owner.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE,
			data: new OwnedCardRefMessage(ownedCard),
		})

		const opponentGroup = ownedCard.owner.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((opponent) =>
				opponent.player.sendMessage({
					type: PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE,
					data: new OwnedCardRefMessage(ownedCard),
				})
			)
		}
	},

	notifyAboutValidActionsChanged(game: ServerGame, targetPlayers: ServerPlayerInGame[]): void {
		targetPlayers.forEach((playerInGame) => {
			const cardsInHand = playerInGame.cardHand.allCards
			const validPlayTargets = cardsInHand.flatMap((card) => card.targeting.getPlayTargets(playerInGame, { checkMana: true }))
			const playTargetMessages = validPlayTargets.map((order) => new CardTargetMessage(order.target))
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.PLAY_TARGETS,
				data: playTargetMessages,
			})

			const messages = game.board.orders.validOrders
				.filter((order) => order.target.sourceCard.ownerGroupInGame.includes(playerInGame))
				.map((order) => new CardTargetMessage(order.target))

			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.UNIT_ORDERS_SELF,
				data: messages,
				highPriority: true,
			})

			const opponentGroup = playerInGame.opponent
			if (opponentGroup) {
				opponentGroup.players.forEach((opponent) =>
					opponent.player.sendMessage({
						type: PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT,
						data: messages,
					})
				)
			}
		})
	},

	notifyAboutCardRevealed(playerGroup: ServerPlayerGroup, card: ServerCard): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.CARD_REVEALED,
				data: new OpenCardMessage(card),
			})
		)
	},

	notifyAboutCardRevealedForPlayer(player: ServerPlayer, card: ServerCard): void {
		player.sendMessage({
			type: PlayerUpdateMessageType.CARD_REVEALED,
			data: new OpenCardMessage(card),
		})
	},

	notifyAboutVictory: (playerGroup: ServerPlayerGroup): void => {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.GAME_END_VICTORY,
				data: null,
			})
		)
	},

	notifyAboutDefeat: (playerGroup: ServerPlayerGroup): void => {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.GAME_END_DEFEAT,
				data: null,
			})
		)
	},

	notifyAboutDraw: (game: ServerGame): void => {
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) =>
				playerInGame.player.sendMessage({
					type: PlayerUpdateMessageType.GAME_END_DRAW,
					data: null,
				})
			)
	},

	notifyAboutLinkedGame: (player: ServerPlayer, linkedGame: ServerGame, suppressEndScreen: boolean): void => {
		player.sendMessage({
			type: PlayerUpdateMessageType.LINKED_GAME,
			data: new GameLinkMessage(linkedGame, suppressEndScreen),
		})
	},

	commandJoinLinkedGame: (player: ServerPlayer): void => {
		player.sendMessage({
			type: PlayerUpdateMessageType.COMMAND_JOIN_LINKED_GAME,
			data: null,
		})
	},

	notifyAboutCardPlayDeclined(player: ServerPlayer, card: ServerCard): void {
		player.sendMessage({
			type: PlayerUpdateMessageType.PLAY_DECLINED,
			data: new CardRefMessage(card),
			highPriority: true,
		})
	},

	notifyAboutRoundStarted: (playerGroup: ServerPlayerGroup): void => {
		const message = new PlayerGroupRefMessage(playerGroup)
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.ROUND_START,
				data: message,
			})
		})
		playerGroup.opponent?.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.ROUND_START,
				data: message,
			})
		})
	},

	notifyAboutTurnStarted: (playerGroup: ServerPlayerGroup): void => {
		const message = new PlayerGroupRefMessage(playerGroup)
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.TURN_START,
				data: message,
			})
		})
		playerGroup.opponent?.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.TURN_START,
				data: message,
			})
		})
	},

	notifyAboutTurnEnded: (playerGroup: ServerPlayerGroup): void => {
		const message = new PlayerGroupRefMessage(playerGroup)
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.TURN_END,
				data: message,
			})
		})
		playerGroup.opponent?.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.TURN_END,
				data: message,
			})
		})
	},

	notifyAboutRoundEnded: (playerGroup: ServerPlayerGroup): void => {
		const message = new PlayerGroupRefMessage(playerGroup)
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.ROUND_END,
				data: message,
			})
		})
		playerGroup.opponent?.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.ROUND_END,
				data: message,
			})
		})
	},
}
