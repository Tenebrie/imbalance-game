import TestGameTemplates from '../../utils/TestGameTemplates'
import TestingSpellHeavyStrike from '../cards/11-testing/TestingSpellHeavyStrike'
import TestingUnitUltraProtector from '../cards/11-testing/TestingUnitUltraProtector'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import SpyInstance = jest.SpyInstance

describe('ServerCard', () => {
	let game: ServerGame
	let player: ServerPlayerInGame
	let playerAction: (callback: () => void) => void
	let hookSpy: SpyInstance

	describe('dealDamage damage redirection', () => {
		beforeEach(() => {
			;({ game, player, playerAction } = TestGameTemplates.singleCardTest(TestingUnitUltraProtector))
			hookSpy = jest.spyOn(game.events, 'applyHooks')
		})

		it('handles infinite redirection', () => {
			const protectors: ServerCard[] = new Array(10).fill(0).map(() => new TestingUnitUltraProtector(game))
			protectors.forEach((protector) => {
				game.board.createUnit(protector, player, 0, 0)
			})
			playerAction(() => {
				const opponentsCard = new TestingSpellHeavyStrike(game)
				player.opponentInGame.players[0].cardHand.addSpell(opponentsCard)
				game.cardPlay.playCardFromHand(new ServerOwnedCard(opponentsCard, player.opponentInGame.players[0]), 0, 0)
				game.cardPlay.selectCardTarget(player.opponentInGame.players[0], game.cardPlay.getDeployTargets()[0].target)
			})
			expect(hookSpy).toBeCalledTimes(11)
		})
	})
})
