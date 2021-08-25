import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import UnitEndlessArmy from '../cards/09-neutral/common/UnitEndlessArmy'
import TestGameTemplates from '../../utils/TestGameTemplates'
import ServerCard from './ServerCard'
import Constants from '@shared/Constants'
import CardLibrary from '../libraries/CardLibrary'
import TokenEmptyDeck from '../cards/09-neutral/tokens/TokenEmptyDeck'
import SpyInstance = jest.SpyInstance
import TestingSpellCastsAnotherSpell from '../cards/11-testing/TestingSpellCastsAnotherSpell'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

describe('ServerGameCardPlay', () => {
	let game: ServerGame
	let player: ServerPlayerInGame
	let eventSpy: SpyInstance

	beforeEach(() => {
		game = TestGameTemplates.emptyDecks()
		player = game.players[1].players[0]
		eventSpy = jest.spyOn(game.events, 'postEvent')
	})

	describe('when card deploy target choice effect plays a card', () => {
		let ownedCard: ServerOwnedCard

		beforeEach(() => {
			;({ game, player, ownedCard } = TestGameTemplates.singleCardTest(TestingSpellCastsAnotherSpell))
		})

		it('waits for target', () => {
			game.cardPlay.playCardAsPlayerAction(ownedCard, 0, 0)
			expect(game.cardPlay.cardResolveStack.currentEntry).toBeDefined()
			expect(game.cardPlay.cardResolveStack.cards.length).toEqual(1)
		})

		it('when target selected, adds another copy to stack', () => {
			game.cardPlay.playCardAsPlayerAction(ownedCard, 0, 0)
			game.cardPlay.selectCardTarget(player, game.cardPlay.getDeployTargets()[0].target)
			expect(game.cardPlay.cardResolveStack.currentEntry).toBeDefined()
			expect(game.cardPlay.cardResolveStack.cards.length).toEqual(2)
		})
	})

	describe('when a player plays a unit card', () => {
		let cardInHand: ServerCard

		beforeEach(() => {
			cardInHand = new UnitEndlessArmy(game)
			player.setUnitMana(3)
			player.cardHand.addUnit(cardInHand)
		})

		describe('can only play cards to rows of the same group', () => {
			let player0: ServerPlayerInGame
			let player1: ServerPlayerInGame

			beforeEach(() => {
				player0 = game.players[0].players[0]
				player1 = game.players[1].players[0]
				player0.setUnitMana(3)
				player1.setUnitMana(3)
			})
			;[0, 1, 2].forEach((index: number) =>
				it(`player 0 can not play the card on row ${index}`, () => {
					game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player0), index, 0)
					expect(game.board.rows[index].cards.length).toEqual(0)
				})
			)
			;[3, 4, 5].forEach((index: number) =>
				it(`player 0 can play the card on row ${index}`, () => {
					game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player0), index, 0)
					expect(game.board.rows[index].cards.length).toEqual(1)
					expect(game.board.rows[index].cards[0].card).toEqual(cardInHand)
				})
			)
			;[3, 4, 5].forEach((index: number) =>
				it(`player 1 can not play the card on row ${index}`, () => {
					game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player1), index, 0)
					expect(game.board.rows[index].cards.length).toEqual(0)
				})
			)
			;[0, 1, 2].forEach((index: number) =>
				it(`player 1 can play the card on row ${index}`, () => {
					game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player1), index, 0)
					expect(game.board.rows[index].cards.length).toEqual(1)
					expect(game.board.rows[index].cards[0].card).toEqual(cardInHand)
				})
			)
		})

		it('deducts unit mana after playing', () => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
			expect(player.unitMana).toEqual(3 - cardInHand.stats.unitCost)
		})

		it('removes the card from hand', () => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
			expect(player.cardHand.unitCards.length).toEqual(0)
		})

		it('posts valid events', () => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
			game.events.resolveEvents()
			expect(eventSpy).toBeCalledTimes(5)
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
					type: 'cardPreResolved',
				})
			)
			expect(eventSpy).nthCalledWith(
				5,
				expect.objectContaining({
					type: 'cardResolved',
				})
			)
		})

		describe('when the target row is full', () => {
			beforeEach(() => {
				for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
					game.board.createUnit(CardLibrary.instantiate(game, TokenEmptyDeck), player, 0, 0)
				}
			})

			it('does not remove the card', () => {
				game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
				expect(player.cardHand.unitCards.length).toEqual(1)
				expect(player.cardHand.unitCards[0]).toEqual(cardInHand)
			})

			it('does not reduce the unit mana', () => {
				game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
				expect(player.unitMana).toEqual(3)
			})

			it('does not create the unit', () => {
				game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
				expect(game.board.rows[0].cards.length).toEqual(Constants.MAX_CARDS_PER_ROW)
				expect(game.board.rows[0].cards.find((unit) => unit.card === cardInHand)).toBeFalsy()
			})
		})
	})
})
