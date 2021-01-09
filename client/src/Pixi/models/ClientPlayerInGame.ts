import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import Player from '@shared/models/Player'
import PlayerInGame from '@shared/models/PlayerInGame'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import ClientCardGraveyard from '@/Pixi/models/ClientCardGraveyard'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import AccessLevel from '@shared/enums/AccessLevel'
import PlayerMessage from '@shared/models/network/player/PlayerMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'

class ClientPlayer implements Player {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel

	constructor(player: PlayerMessage) {
		this.id = player.id
		this.email = player.email
		this.username = player.username
		this.accessLevel = player.accessLevel
	}
}

export default class ClientPlayerInGame implements PlayerInGame {
	player: ClientPlayer
	leader: RenderedCard
	cardHand: RenderedCardHand
	cardDeck: ClientCardDeck
	cardGraveyard: ClientCardGraveyard

	private __morale = 0
	private __unitMana = 0
	private __spellMana = 0
	isTurnActive = false

	constructor(player: Player) {
		this.player = player
		this.cardHand = new RenderedCardHand([], [])
		this.cardDeck = new ClientCardDeck([], [])
		this.cardGraveyard = new ClientCardGraveyard()
	}

	public get morale(): number {
		return this.__morale
	}
	public set morale(value: number) {
		this.__morale = value
		if (this === Core.player) {
			store.commit.gameStateModule.setPlayerMorale(value)
		} else if (this === Core.opponent) {
			store.commit.gameStateModule.setOpponentMorale(value)
		}
	}

	public get unitMana(): number {
		return this.__unitMana
	}
	public set unitMana(value: number) {
		this.__unitMana = value
		if (this === Core.player) {
			store.commit.gameStateModule.setPlayerUnitMana(value)
		}
	}

	public get spellMana(): number {
		return this.__spellMana
	}
	public set spellMana(value: number) {
		this.__spellMana = value
		if (this === Core.player) {
			store.commit.gameStateModule.setPlayerSpellMana(value)
		} else if (this === Core.opponent) {
			store.commit.gameStateModule.setOpponentSpellMana(value)
		}
	}

	public startTurn(): void {
		this.isTurnActive = true
		if (this === Core.player) {
			store.commit.gameStateModule.setIsPlayersTurn(true)
		}
	}

	public endTurn(): void {
		this.isTurnActive = false
		if (this === Core.player) {
			store.commit.gameStateModule.setIsPlayersTurn(false)
		}
	}

	public static fromPlayer(player: Player): ClientPlayerInGame {
		return new ClientPlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): ClientPlayerInGame {
		const player = new ClientPlayer(message.player)
		const clientPlayerInGame = new ClientPlayerInGame(player)
		clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand)
		clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck)
		clientPlayerInGame.morale = message.morale
		clientPlayerInGame.unitMana = message.unitMana
		clientPlayerInGame.spellMana = message.spellMana
		return clientPlayerInGame
	}
}
