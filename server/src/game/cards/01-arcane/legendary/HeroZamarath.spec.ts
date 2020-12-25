import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import HeroZamarath from './HeroZamarath'
import CardLocation from '../../../../../../shared/src/enums/CardLocation'
import CardFeature from '../../../../../../shared/src/enums/CardFeature'
import TestingUnitNoTargeting from '../../11-testing/TestingUnitNoTargeting'
import TestingSpellHeavyStrike from '../../11-testing/TestingSpellHeavyStrike'

describe('HeroZamarath', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let playerAction: (callback: () => void) => void
	let startNextTurn: () => void

	beforeEach(() => {
		;({ game, cardInHand, player, playerAction, startNextTurn } = TestGameTemplates.singleCardTest(HeroZamarath))
	})

	it('gets untargetable when played', () => {
		playerAction(() => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, player), 0, 0)
		})
		expect(cardInHand.location).toEqual(CardLocation.BOARD)
		expect(cardInHand.features.includes(CardFeature.UNTARGETABLE)).toBeTruthy()
	})

	it('intercepts damage and survives with immunity', () => {
		playerAction(() => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, player), 1, 0)
		})

		const targetUnit = new TestingUnitNoTargeting(game)
		playerAction(() => {
			game.board.createUnit(targetUnit, player, 0, 0)

			const opponentsCard = new TestingSpellHeavyStrike(game)
			player.opponentInGame.cardHand.addSpell(opponentsCard)
			game.cardPlay.forcedPlayCardFromHand(new ServerOwnedCard(opponentsCard, player.opponentInGame), 0, 0)
			game.cardPlay.selectCardTarget(player.opponentInGame, game.cardPlay.getValidTargets()[0])
		})

		expect(targetUnit.stats.power).toEqual(10)
		expect(cardInHand.stats.power).toEqual(12)
		expect(cardInHand.stats.armor).toEqual(5)
	})

	it('intercepts damage and dies without immunity', () => {
		playerAction(() => {
			game.cardPlay.playCard(new ServerOwnedCard(cardInHand, player), 1, 0)
		})

		startNextTurn()

		const targetUnit = new TestingUnitNoTargeting(game)
		playerAction(() => {
			game.board.createUnit(targetUnit, player, 0, 0)

			const opponentsCard = new TestingSpellHeavyStrike(game)
			player.opponentInGame.cardHand.addSpell(opponentsCard)
			game.cardPlay.forcedPlayCardFromHand(new ServerOwnedCard(opponentsCard, player.opponentInGame), 0, 0)
			game.cardPlay.selectCardTarget(player.opponentInGame, game.cardPlay.getValidTargets()[0])
		})

		expect(targetUnit.stats.power).toEqual(10)
		expect(cardInHand.stats.power).toEqual(0)
		expect(cardInHand.stats.armor).toEqual(0)
	})
})
