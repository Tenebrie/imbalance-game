import CardLocation from '../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit0PowerVoidspawn from '../../11-testing/TestingUnit0PowerVoidspawn'
import TestingUnit5PowerVoidspawn from '../../11-testing/TestingUnit5PowerVoidspawn'
import UnitShadow from '../tokens/UnitShadow'
import UnitCorporealDespair from './UnitCorporealDespair'

describe('UnitCorporealDespair', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when a valid row is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.add(UnitCorporealDespair).play().targetFirst()
		})

		it('adds a card to stack', () => {
			expect(game.stack.countAll()).toEqual(2)
		})

		it('destroys the allies', () => {
			expect(() => game.board.find(TestingUnit5PowerVoidspawn)).toThrow()
		})

		it('creates a combined shadow card', () => {
			expect(game.player.find(UnitShadow).location).toEqual(CardLocation.STACK)
		})

		describe('when playing combined shadow', () => {
			beforeEach(() => {
				game.player.getStack().targetFirst()
			})

			it('resolves the cards', () => {
				expect(game.stack.countAll()).toEqual(0)
			})

			it('creates a combined shadow unit', () => {
				expect(game.player.find(UnitShadow).location).toEqual(CardLocation.BOARD)
			})

			it('combined shadow has combined power', () => {
				expect(game.player.find(UnitShadow).stats.power).toEqual(15)
			})
		})
	})

	describe('when a valid row is filled with 0-power units', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit0PowerVoidspawn)
			game.player.summon(TestingUnit0PowerVoidspawn)
			game.player.summon(TestingUnit0PowerVoidspawn)
			game.player.add(UnitCorporealDespair).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('destroys the allies', () => {
			expect(() => game.board.find(TestingUnit0PowerVoidspawn)).toThrow()
		})

		it('creates a combined shadow unit', () => {
			expect(game.player.find(UnitShadow).location).toEqual(CardLocation.BOARD)
		})

		it('combined shadow has default power', () => {
			expect(game.player.find(UnitShadow).stats.power).toEqual(1)
		})
	})

	describe('when a valid row belongs to enemy', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit5PowerVoidspawn)
			game.opponent.summon(TestingUnit5PowerVoidspawn)
			game.opponent.summon(TestingUnit5PowerVoidspawn)
			game.player.add(UnitCorporealDespair).play().targetFirst()
		})

		it('does not destroy the enemies', () => {
			expect(game.board.count(TestingUnit5PowerVoidspawn)).toEqual(3)
		})
	})

	describe('when a valid row is not present', () => {
		beforeEach(() => {
			game.player.add(UnitCorporealDespair).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('creates a combined shadow unit', () => {
			expect(game.board.count(UnitShadow)).toEqual(1)
		})

		it('combined shadow has default power', () => {
			expect(game.player.find(UnitShadow).stats.power).toEqual(1)
		})
	})
})
