import CardLibrary from '@src/game/libraries/CardLibrary'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentAguara from './GwentAguara'
import GwentAguaraBoostBoard from './GwentAguaraBoostBoard'
import GwentAguaraBoostHand from './GwentAguaraBoostHand'
import GwentAguaraCharm from './GwentAguaraCharm'
import GwentAguaraDamage from './GwentAguaraDamage'

describe('GwentAguara', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
		CardLibrary.forceLoadCards([GwentAguaraBoostBoard, GwentAguaraBoostHand, GwentAguaraCharm, GwentAguaraDamage])
	})

	describe('when no targets are available', () => {
		it('allows selection of exactly two cards', () => {
			game.player.add(GwentAguara).play().targetFirst().targetFirst()
			expect(game.stack.countAll()).toEqual(0)
		})

		it('shows 4 options for first target', () => {
			game.player.add(GwentAguara).play()
			expect(game.player.getStack().countOptions()).toEqual(4)
		})

		it('shows 3 options for second target', () => {
			game.player.add(GwentAguara).play().targetFirst()
			expect(game.player.getStack().countOptions()).toEqual(3)
		})
	})
})
