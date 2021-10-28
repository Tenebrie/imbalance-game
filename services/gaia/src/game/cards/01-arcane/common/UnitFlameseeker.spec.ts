import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitFlamingPortal from '../tokens/UnitFlamingPortal'
import UnitFlamingShadow from '../tokens/UnitFlamingShadow'
import UnitVoidPortal from '../tokens/UnitVoidPortal'
import UnitFlameseeker from './UnitFlameseeker'

const CardInTesting = UnitFlameseeker

describe('UnitFlameseeker', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when a void portal is present', () => {
		beforeEach(() => {
			game.player.summon(UnitVoidPortal)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('transforms the portal', () => {
			expect(game.board.count(UnitVoidPortal)).toEqual(0)
			expect(game.board.count(UnitFlamingPortal)).toEqual(1)
		})

		it('summons an extra shadow', () => {
			expect(game.board.count(UnitFlamingShadow)).toEqual(2)
		})
	})

	describe('when another ally is present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not move affect the ally', () => {
			expect(game.board.count(TestingUnitNoEffect)).toEqual(1)
		})
	})
})
