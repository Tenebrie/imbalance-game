import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitApathy from '../../11-testing/TestingUnitApathy'
import TestingUnitCommoner from '../../11-testing/TestingUnitCommoner'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitCropField from './UnitCropField'

const CardInTesting = UnitCropField

describe('UnitCropField', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on an empty board', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.endTurn()
		})

		it('does not buff self', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('with an ally present', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitNoEffect)
			game.player.endTurn()
		})

		it('gives an ally buff once', () => {
			const card = game.player.find(TestingUnitNoEffect)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitCropField.BASE_PROC_COUNT)
		})
	})

	describe('with an apathetic ally present', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitApathy)
			game.player.endTurn()
		})

		it('does not buff the ally', () => {
			const card = game.player.find(TestingUnitApathy)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('with an enemy present', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.opponent.summon(TestingUnitNoEffect)
			game.player.endTurn()
		})

		it('does not buff enemy', () => {
			const card = game.opponent.find(TestingUnitNoEffect)
			expect(card.stats.power).toEqual(card.stats.basePower)
		})
	})

	describe('with one non adjacent commoner', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting, 'front')
			game.player.summon(TestingUnitCommoner, 'middle')
			game.player.endTurn()
		})

		it('gives an ally buff once', () => {
			const card = game.player.find(TestingUnitCommoner)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitCropField.BASE_PROC_COUNT)
		})
	})

	describe('with one adjacent commoner', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitCommoner)
			game.player.endTurn()
		})

		it('gives an ally buff twice', () => {
			const card = game.player.find(TestingUnitCommoner)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitCropField.BASE_PROC_COUNT * 2)
		})
	})

	describe('with two adjacent commoners', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnitCommoner)
			game.player.endTurn()
		})

		it('gives every ally buff once', () => {
			const firstCard = game.player.findAt(TestingUnitCommoner, 0)
			expect(firstCard.stats.power).toEqual(firstCard.stats.basePower + UnitCropField.BASE_PROC_COUNT * 2)
			const secondCard = game.player.findAt(TestingUnitCommoner, 0)
			expect(secondCard.stats.power).toEqual(secondCard.stats.basePower + UnitCropField.BASE_PROC_COUNT * 2)
		})
	})
})
