import ServerCard from './ServerCard'
import Deck from '../../../../common/Deck'

export default class ServerDeck extends Deck {

	static defaultDeck(): ServerDeck {
		const deck = new ServerDeck()
		
		deck.addCard(ServerCard.newInstance('test'))
		deck.addCard(ServerCard.newInstance('test'))
		deck.addCard(ServerCard.newInstance('test'))
		
		return deck
	}
}
