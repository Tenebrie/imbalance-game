import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitCreatesAnotherUnit from '../../11-testing/TestingUnitCreatesAnotherUnit'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitEternalTruth from './UnitEternalTruth'

const CardInTesting = UnitEternalTruth

describe('UnitEternalTruth', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when another allied card is played', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.add(TestingUnitNoEffect).play()
		})

		it('receives extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitEternalTruth.POWER_PER_CARD)
		})
	})

	describe("when another opponent's card is played", () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.endTurn()
			game.opponent.add(TestingUnitNoEffect).play()
		})

		it('receives extra power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitEternalTruth.POWER_PER_CARD)
		})
	})

	describe('when a created unit is played', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.add(TestingUnitCreatesAnotherUnit).play().targetFirst()
		})

		it('receives extra power for every card', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + UnitEternalTruth.POWER_PER_CARD * 2)
		})
	})
})
