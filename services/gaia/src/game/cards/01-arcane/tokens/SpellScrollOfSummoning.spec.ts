import CardLocation from '../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit1DirectSummonCount from '../../11-testing/TestingUnit1DirectSummonCount'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import SpellScrollOfSummoning from './SpellScrollOfSummoning'
import UnitFierceShadow from './UnitFierceShadow'

const CardInTesting = SpellScrollOfSummoning

describe('SpellShadowSpark', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played normally', () => {
		beforeEach(() => {
			game.player.addSpellMana(10)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('summons the fierce shadows', () => {
			expect(game.board.count(UnitFierceShadow)).toEqual(SpellScrollOfSummoning.BASE_SHADOWS_SUMMONED)
		})
	})

	describe('when direct summon count is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit1DirectSummonCount)
			game.player.addSpellMana(10)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('respects the leader stat', () => {
			expect(game.board.count(UnitFierceShadow)).toEqual(SpellScrollOfSummoning.BASE_SHADOWS_SUMMONED + 1)
		})
	})

	describe('when all rows are full', () => {
		beforeEach(() => {
			game.player.fillRow(TestingUnitNoEffect, 'front')
			game.player.fillRow(TestingUnitNoEffect, 'middle')
			game.player.fillRow(TestingUnitNoEffect, 'back')
			game.player.addSpellMana(10)
			game.player.add(CardInTesting).play()
		})

		it('will decline play', () => {
			expect(game.player.find(CardInTesting).location).toEqual(CardLocation.HAND)
		})
	})
})
