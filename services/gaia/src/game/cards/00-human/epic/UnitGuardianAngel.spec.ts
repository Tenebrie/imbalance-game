import CardLocation from '../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import { isCardPublic } from '../../../../utils/Utils'
import BuffProtector from '../../../buffs/BuffProtector'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitGuardianAngel from './UnitGuardianAngel'

const CardInTesting = UnitGuardianAngel

describe('UnitGuardianAngel', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	it('is considered a public card', () => {
		expect(isCardPublic(game.player.add(CardInTesting).handle)).toBeTruthy()
	})

	it('has protector buff', () => {
		expect(game.player.add(CardInTesting).buffs.has(BuffProtector)).toBeTruthy()
	})

	describe('on the board', () => {
		describe('when an ally is destoyed', () => {
			beforeEach(() => {
				game.player.summon(CardInTesting)
				game.player.summon(TestingUnit100Power, 'middle').takeDamage(100)
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.power).toEqual(card.stats.basePower)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not prevent damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.GRAVEYARD)
			})
		})
	})

	describe('in hand', () => {
		describe('when an ally takes lethal damage', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power, 'middle').takeDamage(100)
			})

			it('returns card to hand', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.HAND)
			})

			it('jumps onto the board', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.BOARD)
			})
		})

		describe('when an ally takes lethal damage while surrounded by allies', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnitNoEffect, 'middle')
				game.player.summon(TestingUnit100Power, 'middle').takeDamage(100)
				game.player.summon(TestingUnitNoEffect, 'middle')
			})

			it("takes the target's place", () => {
				const unit = game.player.find(CardInTesting).getUnit()
				expect(unit.getRow()).toEqual('middle')
				expect(unit.getRowPosition()).toEqual(1)
			})
		})

		describe('when an ally is destroyed at the end of the round', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnitNoEffect)
				game.startNextRound()
			})

			it('does not summon itself', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.HAND)
			})

			it('does not prevent destruction', () => {
				expect(game.player.find(TestingUnitNoEffect).location).toEqual(CardLocation.GRAVEYARD)
			})
		})
	})
})
