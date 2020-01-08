import ServerCard from './ServerCard'
import CardType from '../../shared/enums/CardType'
import CardDeck from '../../shared/models/CardDeck'
import ServerGame from '../../libraries/game/ServerGame'
import SpellCardDrawer from '../../cards/spells/SpellCardDrawer'
import SpellCardRevealer from '../../cards/spells/SpellCardRevealer'
import UnitPostalRaven from '../../cards/spells/UnitPostalRaven'

export default class ServerCardDeck extends CardDeck {
	cards: ServerCard[]

	constructor(cards: ServerCard[]) {
		super(cards)
		this.cards = cards
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(game: ServerGame): ServerCard {
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

	static emptyDeck(): ServerCardDeck {
		return new ServerCardDeck([])
	}

	static defaultDeck(): ServerCardDeck {
		const deck = new ServerCardDeck([])

		deck.addCard(new SpellCardDrawer())
		deck.addCard(new SpellCardRevealer())
		for (let i = 0; i < 10; i++) {
			deck.addCard(new UnitPostalRaven())
		}

		deck.shuffle()

		return deck
	}
}
