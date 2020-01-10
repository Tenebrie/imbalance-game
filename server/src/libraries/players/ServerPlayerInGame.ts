import ServerPlayer from './ServerPlayer'
import ServerGame from '../game/ServerGame'
import ServerCard from '../../models/game/ServerCard'
import PlayerInGame from '../../shared/models/PlayerInGame'
import ServerCardHand from '../../models/game/ServerCardHand'
import ServerCardDeck from '../../models/game/ServerCardDeck'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerPlayerInGame extends PlayerInGame {
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck
	rowsOwned: number
	timeUnits: number

	constructor(player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(player)
		this.player = player
		this.cardHand = new ServerCardHand(this.player, [])
		this.cardDeck = cardDeck
		this.rowsOwned = 0
		this.timeUnits = 0
	}

	public canPlayCard(card: ServerCard): boolean {
		return this.timeUnits > 0
	}

	public playUnit(game: ServerGame, card: ServerCard, rowIndex: number, unitIndex: number): void {
		const gameBoardRow = game.board.rows[rowIndex]
		if (gameBoardRow.cards.length >= 10) { return }

		/* Remove card from hand */
		this.cardHand.removeCard(card)

		/* Insert the card into the board */
		const cardOnBoard = gameBoardRow.insertCard(card, this, unitIndex)

		/* Invoke the card onPlay effect */
		card.onPlayUnit(game, cardOnBoard)

		/* Advance the time */
		this.setTimeUnits(this.timeUnits - 1)

		/* Send notifications */
		const opponent = game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerCardDestroyed(this.player, card)
		OutgoingMessageHandlers.notifyAboutOpponentCardDestroyed(opponent.player, card)

		OutgoingMessageHandlers.notifyAboutUnitCreated(this.player, cardOnBoard, rowIndex, unitIndex)
		OutgoingMessageHandlers.notifyAboutUnitCreated(opponent.player, cardOnBoard, rowIndex, unitIndex)
	}

	public playSpell(game: ServerGame, card: ServerCard): void {
		/* Remove card from hand */
		this.cardHand.removeCard(card)

		/* Invoke the card onPlay effect */
		card.onPlaySpell(game, this)

		/* Advance the time */
		this.setTimeUnits(this.timeUnits - 1)

		/* Send notifications */
		const opponent = game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerCardDestroyed(this.player, card)
		OutgoingMessageHandlers.notifyAboutOpponentCardDestroyed(opponent.player, card)
	}

	public drawCards(game: ServerGame, count: number): void {
		const cards: ServerCard[] = []
		for (let i = 0; i < count; i++) {
			const card = this.cardDeck.drawCard(game)
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.drawCard(card, game)
			cards.push(card)
		}

		OutgoingMessageHandlers.notifyAboutCardsDrawn(this.player, cards)
		const opponent = game.players.find(playerInGame => playerInGame.player !== this.player)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentCardsDrawn(opponent.player, cards)
		}
	}

	public advanceTime(): void {
		this.setTimeUnits(this.timeUnits + 1)
	}

	private setTimeUnits(timeUnits: number): void {
		this.timeUnits = timeUnits
		OutgoingMessageHandlers.notifyAboutPlayerTimeBankChange(this.player, this)
	}

	static newInstance(player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerPlayerInGame(player, cardDeck)
	}
}
