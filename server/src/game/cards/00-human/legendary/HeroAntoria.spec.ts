import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import HeroAntoria from './HeroAntoria'
import TestingSpellQuickStrike from '../../11-testing/TestingSpellQuickStrike'
import TestingUnitNoTargeting from '../../11-testing/TestingUnitNoTargeting'
import TestingSpellHeavyStrike from '../../11-testing/TestingSpellHeavyStrike'
import CardLocation from '../../../../../../shared/src/enums/CardLocation'

describe('HeroAntoria', () => {
	let game: ServerGame
	let playersCard: ServerCard
	let opponentsCard: ServerCard
	let player: ServerPlayerInGame

	beforeEach(() => {
		;({ game, playersCard, opponentsCard, player } = TestGameTemplates.opponentCardTest(TestingSpellQuickStrike, HeroAntoria))
	})

	it('intercepts damage', () => {
		const damageTarget = game.board.createUnit(new TestingUnitNoTargeting(game), 4, 0)!
		game.cardPlay.playCard(new ServerOwnedCard(playersCard, player), 0, 0)
		game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
		game.events.resolveEvents()
		expect(damageTarget.card.stats.power).toEqual(10)
		expect(opponentsCard.stats.power).toEqual(14)
	})

	describe('when it takes fatal damage', () => {
		let unitInDeck: ServerCard

		beforeEach(() => {
			;({ game, playersCard, opponentsCard, player } = TestGameTemplates.opponentCardTest(TestingSpellHeavyStrike, HeroAntoria))
			unitInDeck = new TestingUnitNoTargeting(game)
			player.opponentInGame.cardDeck.addUnitToTop(unitInDeck)

			game.board.createUnit(new TestingUnitNoTargeting(game), 4, 0)
			game.cardPlay.playCard(new ServerOwnedCard(playersCard, player), 0, 0)
			game.cardPlay.selectCardTarget(player, game.cardPlay.getValidTargets()[0])
			game.events.resolveEvents()
		})

		it('gets destroyed', () => {
			expect(opponentsCard.location).toEqual(CardLocation.UNKNOWN)
			expect(player.opponentInGame.cardHand.allCards.indexOf(opponentsCard)).toEqual(-1)
		})

		it('draws a card', () => {
			expect(opponentsCard.location).toEqual(CardLocation.UNKNOWN)
			expect(player.opponentInGame.cardHand.allCards.length).toEqual(1)
			expect(player.opponentInGame.cardDeck.allCards.length).toEqual(0)
			expect(player.opponentInGame.cardHand.allCards.indexOf(unitInDeck)).toEqual(0)
		})
	})
})
