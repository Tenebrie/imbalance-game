import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitFierceShadow from '../tokens/UnitFierceShadow'
import UnitShiftingShadow from './UnitShiftingShadow'

describe('UnitShiftingShadow', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when target row is empty', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect)
			game.player.add(UnitShiftingShadow).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('moves the card', () => {
			expect(game.board.find(TestingUnitNoEffect).getRow()).toEqual('middle')
		})

		it('creates a shadow', () => {
			expect(game.board.find(UnitFierceShadow).getRow()).toEqual('front')
		})
	})

	describe('when the only target is an enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect)
			game.player.add(UnitShiftingShadow).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not move the card', () => {
			expect(game.board.find(TestingUnitNoEffect).getRow()).toEqual('front')
		})
	})
})
