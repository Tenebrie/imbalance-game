import ServerGame from '../../../models/ServerGame'
import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import HeroZamarath from './HeroZamarath'
import CardLocation from '../../../../../../shared/src/enums/CardLocation'
import CardFeature from '../../../../../../shared/src/enums/CardFeature'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
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

	it('always has protector', () => {
		expect(cardInHand.features.includes(CardFeature.PROTECTOR)).toBeTruthy()
	})

	it('gets untargetable when played', () => {
		playerAction(() => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 0, 0)
		})
		expect(cardInHand.location).toEqual(CardLocation.BOARD)
		expect(cardInHand.features.includes(CardFeature.UNTARGETABLE)).toBeTruthy()
	})

	it('intercepts damage and survives with immunity', () => {
		playerAction(() => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 1, 0)
		})

		const targetUnit = new TestingUnitNoEffect(game)
		playerAction(() => {
			game.board.createUnit(targetUnit, player, 0, 0)

			const opponentsCard = new TestingSpellHeavyStrike(game)
			player.opponentInGame.players[0].cardHand.addSpell(opponentsCard)
			game.cardPlay.playCardFromHand(new ServerOwnedCard(opponentsCard, player.opponentInGame.players[0]), 0, 0)
			game.cardPlay.selectCardTarget(player.opponentInGame.players[0], game.cardPlay.getDeployTargets()[0].target)
		})

		expect(targetUnit.stats.power).toEqual(20)
		expect(cardInHand.stats.power).toEqual(24)
		expect(cardInHand.stats.armor).toEqual(10)
	})

	it('intercepts damage and dies without immunity', () => {
		playerAction(() => {
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(cardInHand, player), 1, 0)
		})

		startNextTurn()

		const targetUnit = new TestingUnitNoEffect(game)
		playerAction(() => {
			game.board.createUnit(targetUnit, player, 0, 0)
		})
		playerAction(() => {
			const opponentsCard = new TestingSpellHeavyStrike(game)
			player.opponentInGame.players[0].cardHand.addSpell(opponentsCard)
			game.cardPlay.playCardFromHand(new ServerOwnedCard(opponentsCard, player.opponentInGame.players[0]), 0, 0)
			game.cardPlay.selectCardTarget(player.opponentInGame.players[0], game.cardPlay.getDeployTargets()[0].target)
		})

		expect(targetUnit.stats.power).toEqual(20)
		expect(cardInHand.stats.power).toEqual(0)
		expect(cardInHand.stats.armor).toEqual(0)
	})
})
