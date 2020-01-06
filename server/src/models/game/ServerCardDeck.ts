import ServerCard from './ServerCard'
import Card from '../../shared/models/Card'
import Deck from '../../shared/models/CardDeck'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayer from '../../libraries/players/ServerPlayer'

export default class ServerCardDeck extends Deck {
	player: ServerPlayer

	constructor(player: ServerPlayer, cards: Card[]) {
		super(cards)
		this.player = player
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

	static defaultDeck(player: ServerPlayer): ServerCardDeck {
		const deck = new ServerCardDeck(player, [])

		deck.addCard(ServerCard.newInstance('sw-аура'))
		deck.addCard(ServerCard.newInstance('sw-вельТарьенна'))
		deck.addCard(ServerCard.newInstance('sw-верныйсокол'))
		deck.addCard(ServerCard.newInstance('sw-ветранна'))
		deck.addCard(ServerCard.newInstance('sw-заклинательворонов'))
		deck.addCard(ServerCard.newInstance('sw-игриваяпикси'))
		deck.addCard(ServerCard.newInstance('sw-коргиссимус'))
		deck.addCard(ServerCard.newInstance('sw-любопытныйволчонок'))
		deck.addCard(ServerCard.newInstance('sw-неария'))
		deck.addCard(ServerCard.newInstance('sw-облачныйстраж'))

		deck.shuffle()

		return deck
	}
}
