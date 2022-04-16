import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import TestingSpellDeals100Damage from '../../11-testing/TestingSpellDeals100Damage'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import HeroZamarath from './HeroZamarath'

describe('HeroZamarath', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let opponent: ServerPlayerInGame
	let playerAction: (callback: () => void) => void
	let startNextTurn: () => void

	beforeEach(() => {
		;({ game, cardInHand, player, opponent, playerAction, startNextTurn } = TestGameTemplates.singleCardTest(HeroZamarath))
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

			const opponentsCard = new TestingSpellDeals100Damage(game)
			player.opponent.players[0].cardHand.addSpell(opponentsCard)
			game.cardPlay.playCardFromHand(new ServerOwnedCard(opponentsCard, player.opponent.players[0]), 0, 0)
			game.cardPlay.selectCardTarget(player.opponent.players[0], game.cardPlay.getDeployTargets()[0].target)
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
			const opponentsCard = new TestingSpellDeals100Damage(game)
			opponent.cardHand.addSpell(opponentsCard)
			game.cardPlay.playCardFromHand(new ServerOwnedCard(opponentsCard, opponent), 0, 0)
			game.cardPlay.selectCardTarget(opponent, game.cardPlay.getDeployTargets()[0].target)
		})

		expect(targetUnit.stats.power).toEqual(20)
		expect(cardInHand.stats.power).toEqual(0)
		expect(cardInHand.stats.armor).toEqual(0)
	})
})
