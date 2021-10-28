import CardLocation from '../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import { isCardPublic } from '../../../../utils/Utils'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import SpellBloodPlague from '../spells/SpellBloodPlague'
import HeroPlagueEngineer from './HeroPlagueEngineer'

const CardInTesting = HeroPlagueEngineer

describe('HeroPlagueEngineer', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it("adds the blood plague card into the opponent's hand", () => {
			expect(() => game.opponent.find(SpellBloodPlague)).not.toThrow()
		})

		it('blood plague is revealed', () => {
			expect(isCardPublic(game.opponent.find(SpellBloodPlague).handle)).toBeTruthy()
		})
	})

	describe('on round start', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.startNextRound()
		})

		it('stays on the board', () => {
			expect(game.player.find(CardInTesting).location).toEqual(CardLocation.BOARD)
		})

		it("adds exactly one blood plague card into the opponent's hand", () => {
			expect(() => game.opponent.findAt(SpellBloodPlague, 0)).not.toThrow()
			expect(() => game.opponent.findAt(SpellBloodPlague, 1)).toThrow()
		})

		it('blood plague is revealed', () => {
			expect(isCardPublic(game.opponent.find(SpellBloodPlague).handle)).toBeTruthy()
		})
	})
})
