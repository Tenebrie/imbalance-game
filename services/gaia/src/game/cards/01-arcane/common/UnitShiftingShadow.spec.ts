import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitApathy from '../../11-testing/TestingUnitApathy'
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
			game.player.add(UnitShiftingShadow).playTo('back').targetFirst().targetFirst()
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

	describe('when can move on the same row', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitApathy)
			game.player.summon(TestingUnitNoEffect)
			game.player.summon(TestingUnitApathy)
			game.player.summon(TestingUnitApathy)
			game.player.add(UnitShiftingShadow).playTo('back').targetNth(1).targetNth(1)
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('moves the card', () => {
			expect(game.board.find(TestingUnitNoEffect).getRow()).toEqual('front')
			expect(game.board.find(TestingUnitNoEffect).getRowPosition()).toEqual(3)
		})

		it("creates a shadow on the target's old position", () => {
			expect(game.board.find(UnitFierceShadow).getRow()).toEqual('front')
			expect(game.board.find(UnitFierceShadow).getRowPosition()).toEqual(1)
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
