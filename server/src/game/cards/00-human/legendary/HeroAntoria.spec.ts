import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import HeroAntoria from './HeroAntoria'
import TestingSpellQuickStrike from '../../11-testing/TestingSpellQuickStrike'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import TestingSpellHeavyStrike from '../../11-testing/TestingSpellHeavyStrike'
import CardLocation from '../../../../../../shared/src/enums/CardLocation'

describe('HeroAntoria', () => {
	let game: ServerGame
	let playersCard: ServerCard
	let opponentsCard: ServerCard
	let player: ServerPlayerInGame
	let playerAction: (callback: () => void) => void

	beforeEach(() => {
		;({ game, playersCard, opponentsCard, player, playerAction } = TestGameTemplates.opponentCardTest(TestingSpellQuickStrike, HeroAntoria))
	})

	it('intercepts damage', () => {
		const damageTarget = game.board.createUnit(new TestingUnitNoEffect(game), 4, 0)!
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(playersCard, player), 0, 0)
		})
		playerAction(() => {
			game.cardPlay.selectCardTarget(player, game.cardPlay.getDeployTargets()[0].target)
		})
		expect(damageTarget.card.stats.power).toEqual(20)
		expect(opponentsCard.stats.power).toEqual(24)
	})

	describe('when it takes fatal damage', () => {
		let unitInDeck: ServerCard

		beforeEach(() => {
			;({ game, playersCard, opponentsCard, player } = TestGameTemplates.opponentCardTest(TestingSpellHeavyStrike, HeroAntoria))
			unitInDeck = new TestingUnitNoEffect(game)
			player.opponentInGame.cardDeck.addUnitToTop(unitInDeck)

			game.board.createUnit(new TestingUnitNoEffect(game), 4, 0)
			playerAction(() => {
				game.cardPlay.playCardFromHand(new ServerOwnedCard(playersCard, player), 0, 0)
			})
			playerAction(() => {
				game.cardPlay.selectCardTarget(player, game.cardPlay.getDeployTargets()[0].target)
			})
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
