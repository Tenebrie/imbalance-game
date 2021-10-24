import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import Player from '@shared/models/Player'
import PlayerGroup from '@shared/models/PlayerGroup'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import store from '@/Vue/store'

export default class ClientPlayerGroup implements PlayerGroup {
	id: string
	players: ClientPlayerInGame[]

	isTurnActive = false
	__roundWins: number

	constructor(id: string) {
		this.id = id
		this.players = []
		this.__roundWins = 0
	}

	public get username(): string {
		return this.players.map((playerInGame) => playerInGame.player.username).join(', ')
	}

	public get roundWins(): number {
		return this.__roundWins
	}
	public set roundWins(value: number) {
		this.__roundWins = value
		if (this === Core.player) {
			store.commit.gameStateModule.setPlayerRoundWins(value)
		} else if (this === Core.opponent) {
			store.commit.gameStateModule.setOpponentRoundWins(value)
		}
	}

	public includes(playerOrPlayerId: string | ClientPlayerInGame): boolean {
		if (typeof playerOrPlayerId === 'object') {
			playerOrPlayerId = playerOrPlayerId.player.id
		}
		return this.players.some((player) => player.player.id === playerOrPlayerId)
	}

	public addPlayer(message: PlayerInGameMessage): void {
		const player = this.players.find((player) => player.player.id === message.player.id) || new ClientPlayerInGame(message.player)
		this.players.push(player)
		player.player.id = message.player.id
		player.player.username = message.player.username
		player.leader = RenderedCard.fromMessage(message.leader)
		player.cardHand = RenderedCardHand.fromMessage(message.cardHand)
		player.cardDeck = ClientCardDeck.fromMessage(message.cardDeck)
		player.cardGraveyard = ClientCardDeck.fromMessage(message.cardGraveyard)
		player.unitMana = message.unitMana
		player.spellMana = message.spellMana
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
}
