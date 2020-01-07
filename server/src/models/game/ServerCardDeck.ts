import ServerCard from './ServerCard'
import CardDeck from '../../shared/models/CardDeck'
import ServerGame from '../../libraries/game/ServerGame'
import SpellCardDrawer from '../../cards/spells/SpellCardDrawer'
import SpellCardRevealer from '../../cards/spells/SpellCardRevealer'

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

		for (let i = 0; i < 5; i++) {
			deck.addCard(new SpellCardDrawer())
		}
		for (let i = 0; i < 5; i++) {
			deck.addCard(new SpellCardRevealer())
		}

		deck.addCard(ServerCard.newInstance('sw-аура'))
		deck.addCard(ServerCard.newInstance('sw-вельТарьенна'))
		deck.addCard(ServerCard.newInstance('sw-верныйсокол'))
		/* deck.addCard(ServerCard.newInstance('sw-ветранна'))
		deck.addCard(ServerCard.newInstance('sw-заклинательворонов'))
		deck.addCard(ServerCard.newInstance('sw-игриваяпикси'))
		deck.addCard(ServerCard.newInstance('sw-коргиссимус'))
		deck.addCard(ServerCard.newInstance('sw-любопытныйволчонок'))
		deck.addCard(ServerCard.newInstance('sw-неария'))
		deck.addCard(ServerCard.newInstance('sw-облачныйстраж')) */

		deck.shuffle()

		return deck
	}
}
