import ServerCard from './ServerCard'
import CardDeck from '../../shared/models/CardDeck'
import HeroSatia from '../../cards/heroes/HeroSatia'
import UnitPostalRaven from '../../cards/units/UnitPostalRaven'
import ServerGame from '../../libraries/game/ServerGame'
import UnitPossessedVulture from '../../cards/units/UnitPossessedVulture'
import CardLibrary from '../../libraries/card/CardLibrary'

export default class ServerCardDeck extends CardDeck {
	game: ServerGame
	cards: ServerCard[]

	constructor(game: ServerGame, cards: ServerCard[]) {
		super(cards)
		this.game = game
		this.cards = cards
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(): ServerCard {
		return this.cards.pop()
	}

	public shuffle(): void {
		let counter = this.cards.length

		while (counter > 0) {
			const index = Math.floor(Math.random() * counter)
			counter--
			const temp = this.cards[counter]
			this.cards[counter] = this.cards[index]
			this.cards[index] = temp
		}
	}

	static emptyDeck(game: ServerGame): ServerCardDeck {
		return new ServerCardDeck(game, [])
	}

	static defaultDeck(game: ServerGame): ServerCardDeck {
		const deck = new ServerCardDeck(game, [])

		deck.addCard(CardLibrary.createCard(new HeroSatia(game)))
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitPostalRaven(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitPossessedVulture(game)))
		}

		deck.shuffle()

		return deck
	}
}
