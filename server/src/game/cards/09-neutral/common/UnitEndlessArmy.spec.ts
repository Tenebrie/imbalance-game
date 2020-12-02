import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import UnitEndlessArmy from './UnitEndlessArmy'
import ServerOwnedCard from '../../../models/ServerOwnedCard'

describe('ServerGameCardPlay', () => {
	let game: ServerGame

	beforeEach(() => {
		game = TestGameTemplates.emptyDecks()
	})

	describe('when a player has UnitEndlessCard in the unit hand', () => {
		let cardInHand: ServerCard

		beforeEach(() => {
			game = TestGameTemplates.emptyDecks()
			cardInHand = new UnitEndlessArmy(game)
			game.players[1].setUnitMana(1)
			game.players[1].cardHand.addUnit(cardInHand)
		})

		it('adds another endless army to the owner\'s deck', () => {
			expect(game.players[1].cardDeck.unitCards.length).toEqual(0)
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[1]), 0, 0)
			expect(game.players[1].cardDeck.unitCards.length).toEqual(1)
			expect(game.players[1].cardDeck.unitCards[0].class).toEqual(cardInHand.class)
		})
	})
})
