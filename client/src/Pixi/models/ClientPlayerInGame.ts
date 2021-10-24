import AccessLevel from '@shared/enums/AccessLevel'
import PlayerMessage from '@shared/models/network/player/PlayerMessage'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import Player from '@shared/models/Player'
import PlayerInGame from '@shared/models/PlayerInGame'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import ClientCardGraveyard from '@/Pixi/models/ClientCardGraveyard'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import store from '@/Vue/store'

class ClientPlayer implements Player {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	isGuest: boolean

	constructor(player: PlayerMessage) {
		this.id = player.id
		this.email = player.email
		this.username = player.username
		this.accessLevel = player.accessLevel
		this.isGuest = player.isGuest
	}
}

export default class ClientPlayerInGame implements PlayerInGame {
	player: ClientPlayer
	leader!: RenderedCard
	cardHand: RenderedCardHand
	cardDeck: ClientCardDeck
	cardGraveyard: ClientCardGraveyard

	private __unitMana = 0
	private __spellMana = 0

	constructor(player: Player) {
		this.player = player
		this.cardHand = new RenderedCardHand([], [])
		this.cardDeck = new ClientCardDeck([], [])
		this.cardGraveyard = new ClientCardGraveyard()
	}

	public get group(): ClientPlayerGroup {
		return Core.opponent && Core.opponent.players.includes(this) ? Core.opponent : Core.player
	}

	public get unitMana(): number {
		return this.__unitMana
	}
	public set unitMana(value: number) {
		this.__unitMana = value
		if (this.group === Core.player) {
			store.commit.gameStateModule.setPlayerUnitMana(value)
		}
	}

	public get spellMana(): number {
		return this.__spellMana
	}
	public set spellMana(value: number) {
		this.__spellMana = value
		if (this.group === Core.player) {
			store.commit.gameStateModule.setPlayerSpellMana(value)
		} else if (Core.opponent && this.group === Core.opponent) {
			store.commit.gameStateModule.setOpponentSpellMana(value)
		}
	}

	public destroyObject(): void {
		this.cardHand.allCards.forEach((card) => this.cardHand.destroyCard(card))
	}

	public static fromPlayer(player: Player): ClientPlayerInGame {
		return new ClientPlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): ClientPlayerInGame {
		const player = new ClientPlayer(message.player)
		const clientPlayerInGame = new ClientPlayerInGame(player)
		clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand)
		clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck)
		clientPlayerInGame.unitMana = message.unitMana
		clientPlayerInGame.spellMana = message.spellMana
		return clientPlayerInGame
	}
}
