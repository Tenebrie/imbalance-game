import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import TestGameTemplates from '../../utils/TestGameTemplates'
import ServerCard from './ServerCard'
import ServerGameEvents from './ServerGameEvents'
import GameEventCreators, { GameStartedEventArgs } from './events/GameEventCreators'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameEventType from '../../../../shared/src/enums/GameEventType'
import TestingUnitTargetsRow from '../cards/07-testing/TestingUnitTargetsRow'
import TestingUnitNoTargeting from '../cards/07-testing/TestingUnitNoTargeting'
import TestingSpellTacticalMove from '../cards/07-testing/TestingSpellTacticalMove'
import TestingSpellQuickStrike from '../cards/07-testing/TestingSpellQuickStrike'
import SpyInstance = jest.SpyInstance

describe('ServerGameEvents', () => {
	let game: ServerGame
	let events: ServerGameEvents
	let player: ServerPlayerInGame
	let callbackSpy: () => void
	let callbackSpyB: () => void
	let callbackSpyC: () => void

	beforeEach(() => {
		game = TestGameTemplates.emptyDecks()
		events = game.events
		player = game.players[0]
		callbackSpy = jest.fn()
		callbackSpyB = jest.fn()
		callbackSpyC = jest.fn()
	})

	describe('event resolution', () => {
		it('does not resolve events immediately', () => {
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpy())

			events.postEvent(GameEventCreators.gameStarted({ player }))

			expect(callbackSpy).toHaveBeenCalledTimes(0)
		})

		it('does not trigger callbacks for another event', () => {
			events.createCallback<GameStartedEventArgs>(game, GameEventType.ROUND_STARTED).perform(() => callbackSpy())

			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.resolveEvents()

			expect(callbackSpy).toHaveBeenCalledTimes(0)
		})

		it('resolves single event from the queue', () => {
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpy())

			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.resolveEvents()

			expect(callbackSpy).toHaveBeenCalledTimes(1)
		})

		it('resolves multiple callbacks for the same event', () => {
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpy())
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpyB())
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpyC())

			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.resolveEvents()

			expect(callbackSpy).toHaveBeenCalledTimes(1)
			expect(callbackSpyB).toHaveBeenCalledTimes(1)
			expect(callbackSpyC).toHaveBeenCalledTimes(1)
		})

		it('resolves multiple events from the queue', () => {
			events.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED).perform(() => callbackSpy())

			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.resolveEvents()

			expect(callbackSpy).toHaveBeenCalledTimes(3)
		})

		it('resolves chaining events', () => {
			events
				.createCallback<GameStartedEventArgs>(game, GameEventType.GAME_STARTED)
				.perform(() => events.postEvent(GameEventCreators.roundStarted({ player })))
			events
				.createCallback<GameStartedEventArgs>(game, GameEventType.ROUND_STARTED)
				.perform(() => events.postEvent(GameEventCreators.roundEnded({ player })))
			events.createCallback<GameStartedEventArgs>(game, GameEventType.ROUND_ENDED).perform(() => callbackSpy())

			events.postEvent(GameEventCreators.gameStarted({ player }))
			events.resolveEvents()

			expect(callbackSpy).toHaveBeenCalledTimes(1)
		})

		describe('card resolution without targeting', () => {
			let cardInHand: ServerCard
			let resolutionStackSpy: SpyInstance
			let ownedCard: ServerOwnedCard

			beforeEach(() => {
				;({ game, cardInHand, player, ownedCard } = TestGameTemplates.singleCardTest(TestingUnitNoTargeting))
				events = game.events
				resolutionStackSpy = jest.spyOn(game.cardPlay.cardResolveStack, 'finishResolving')
			})

			it('pops card resolution stack', () => {
				game.cardPlay.cardResolveStack.startResolving(ownedCard, () => game.cardPlay.updateResolvingCardTargetingStatus())

				events.resolveEvents()

				expect(resolutionStackSpy).toHaveBeenCalled()
				expect(game.cardPlay.cardResolveStack.cards.length).toEqual(0)
			})

			it('resolves multiple cards', () => {
				const ownedCards = [
					{
						card: cardInHand,
						owner: player,
					},
					{
						card: new TestingUnitNoTargeting(game),
						owner: player,
					},
					{
						card: new TestingUnitNoTargeting(game),
						owner: player,
					},
					{
						card: new TestingUnitNoTargeting(game),
						owner: player,
					},
					{
						card: new TestingUnitNoTargeting(game),
						owner: player,
					},
					{
						card: new TestingUnitNoTargeting(game),
						owner: player,
					},
				]
				ownedCards.forEach((card) => {
					game.cardPlay.cardResolveStack.startResolving(card, () => game.cardPlay.updateResolvingCardTargetingStatus())
				})

				events.resolveEvents()

				expect(resolutionStackSpy).toHaveBeenCalledTimes(6)
				expect(game.cardPlay.cardResolveStack.cards.length).toEqual(0)
			})
		})

		describe('card resolution with simple targeting', () => {
			let ownedCard: ServerOwnedCard
			let resolutionStackSpy: SpyInstance

			beforeEach(() => {
				;({ game, player, ownedCard } = TestGameTemplates.singleCardTest(TestingSpellQuickStrike))
				events = game.events
				resolutionStackSpy = jest.spyOn(game.cardPlay.cardResolveStack, 'finishResolving')
			})

			it('switches targeting to next card in queue', () => {
				game.board.createUnit(new TestingUnitNoTargeting(game), player.opponentInGame, 4, 0)

				const valkyrie = new TestingUnitTargetsRow(game)
				player.cardHand.addUnit(valkyrie)

				game.cardPlay.forcedPlayCardFromHand(ownedCard, 0, 0)
				events.resolveEvents()
				game.cardPlay.forcedPlayCardFromHand({ card: valkyrie, owner: player }, 0, 0)
				events.resolveEvents()
				game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
				events.resolveEvents()

				expect(resolutionStackSpy).toHaveBeenCalledTimes(1)
				expect(game.board.getAllUnits().length).toEqual(2)
				expect(game.cardPlay.cardResolveStack.cards.length).toEqual(1)
				expect(game.cardPlay.cardResolveStack.cards[0].card.class).toEqual('testingUnitTargetsRow')
			})
		})

		describe('multistage card targeting', () => {
			let ownedCard: ServerOwnedCard
			let resolutionStackSpy: SpyInstance

			beforeEach(() => {
				;({ game, player, ownedCard } = TestGameTemplates.singleCardTest(TestingSpellTacticalMove))
				events = game.events
				resolutionStackSpy = jest.spyOn(game.cardPlay.cardResolveStack, 'finishResolving')
				game.board.createUnit(new TestingUnitNoTargeting(game), player, 0, 0)
			})

			it('keeps card resolving after first target', () => {
				game.cardPlay.forcedPlayCardFromHand(ownedCard, 0, 0)
				events.resolveEvents()
				game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
				events.resolveEvents()

				expect(resolutionStackSpy).toHaveBeenCalledTimes(0)
				expect(game.cardPlay.cardResolveStack.cards.length).toEqual(1)
				expect(game.cardPlay.cardResolveStack.cards[0].card.class).toEqual('testingSpellTacticalMove')
			})

			it('resolves card after second target', () => {
				game.cardPlay.forcedPlayCardFromHand(ownedCard, 0, 0)
				events.resolveEvents()
				game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
				events.resolveEvents()
				game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
				events.resolveEvents()

				expect(resolutionStackSpy).toHaveBeenCalledTimes(1)
				expect(game.cardPlay.cardResolveStack.cards.length).toEqual(0)
			})
		})
	})
})
