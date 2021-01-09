import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import UnitEndlessArmy from '../cards/09-neutral/common/UnitEndlessArmy'
import TestGameTemplates from '../../utils/TestGameTemplates'
import ServerCard from './ServerCard'
import Constants from '@shared/Constants'
import CardLibrary from '../libraries/CardLibrary'
import TokenEmptyDeck from '../cards/09-neutral/tokens/TokenEmptyDeck'
import SpyInstance = jest.SpyInstance

describe('ServerGameCardPlay', () => {
	let game: ServerGame
	let eventSpy: SpyInstance

	beforeEach(() => {
		game = TestGameTemplates.emptyDecks()
		eventSpy = jest.spyOn(game.events, 'postEvent')
	})

	describe('when a player plays a unit card', () => {
		let cardInHand: ServerCard

		beforeEach(() => {
			cardInHand = new UnitEndlessArmy(game)
			game.players[0].setUnitMana(3)
			game.players[0].cardHand.addUnit(cardInHand)
		})
		;[0, 1, 2].forEach((index: number) =>
			it(`player 0 can not play the card on row ${index}`, () => {
				game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), index, 0)
				expect(game.board.rows[index].cards.length).toEqual(0)
			})
		)
		;[3, 4, 5].forEach((index: number) =>
			it(`player 0 can play the card on row ${index}`, () => {
				game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), index, 0)
				expect(game.board.rows[index].cards.length).toEqual(1)
				expect(game.board.rows[index].cards[0].card).toEqual(cardInHand)
			})
		)

		it('deducts unit mana after playing', () => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 4, 0)
			expect(game.players[0].unitMana).toEqual(3 - cardInHand.stats.unitCost)
		})

		it('removes the card from hand', () => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 4, 0)
			expect(game.players[0].cardHand.unitCards.length).toEqual(0)
		})

		it('posts valid events', () => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 4, 0)
			game.events.resolveEvents()
			expect(eventSpy).toBeCalledTimes(4)
			expect(eventSpy).nthCalledWith(
				1,
				expect.objectContaining({
					type: 'cardPlayed',
				})
			)
			expect(eventSpy).nthCalledWith(
				2,
				expect.objectContaining({
					type: 'unitCreated',
				})
			)
			expect(eventSpy).nthCalledWith(
				3,
				expect.objectContaining({
					type: 'unitDeployed',
				})
			)
			expect(eventSpy).nthCalledWith(
				4,
				expect.objectContaining({
					type: 'cardResolved',
				})
			)
		})

		describe('when the target row is full', () => {
			beforeEach(() => {
				for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
					game.board.createUnit(CardLibrary.instantiateByConstructor(game, TokenEmptyDeck), 0, 0)
				}
			})

			it('does not remove the card', () => {
				game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 0, 0)
				expect(game.players[0].cardHand.unitCards.length).toEqual(1)
				expect(game.players[0].cardHand.unitCards[0]).toEqual(cardInHand)
			})

			it('does not reduce the unit mana', () => {
				game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 0, 0)
				expect(game.players[0].unitMana).toEqual(3)
			})

			it('does not create the unit', () => {
				game.cardPlay.playCard(new ServerOwnedCard(cardInHand, game.players[0]), 0, 0)
				expect(game.board.rows[0].cards.length).toEqual(Constants.MAX_CARDS_PER_ROW)
				expect(game.board.rows[0].cards.find((unit) => unit.card === cardInHand)).toBeFalsy()
			})
		})
	})
})
