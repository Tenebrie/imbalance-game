import { setupTestGame, TestGame, TestGameBuff } from '../../../../utils/TestGame'
import TestingBuffDispellableNegative from '../../../buffs/11-testing/TestingBuffDispellableNegative'
import TestingBuffDispellableNeutral from '../../../buffs/11-testing/TestingBuffDispellableNeutral'
import TestingBuffDispellablePositive from '../../../buffs/11-testing/TestingBuffDispellablePositive'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitCleansingFlame from './UnitCleansingFlame'

const CardInTesting = UnitCleansingFlame

describe('UnitCleansingFlame', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('on an empty board', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('when has buff itself', () => {
		beforeEach(() => {
			game.player.add(CardInTesting).buffs.add(TestingBuffDispellableNeutral)
			game.player.find(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('still has the buff', () => {
			expect(game.player.find(CardInTesting).buffs.has(TestingBuffDispellableNeutral)).toEqual(true)
		})
	})

	describe('when an ally has negative buff', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellableNegative)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('removes the buff from an ally', () => {
			expect(game.player.find(TestingUnitNoEffect).buffs.has(TestingBuffDispellableNegative)).toEqual(false)
		})
	})

	describe('when an ally has neutral buff', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellableNeutral)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('removes the buff from an ally', () => {
			expect(game.player.find(TestingUnitNoEffect).buffs.has(TestingBuffDispellableNeutral)).toEqual(false)
		})
	})

	describe('when an ally has positive buff', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellablePositive)
			game.player.add(CardInTesting).play()
		})

		it('does not consider the ally valid target', () => {
			expect(() => game.player.getStack().targetFirst()).toThrow()
		})
	})

	describe('when an ally has a positive and a negative buff', () => {
		beforeEach(() => {
			const buffs = game.player.summon(TestingUnitNoEffect).buffs
			buffs.add(TestingBuffDispellablePositive)
			buffs.add(TestingBuffDispellableNegative)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('only removes the negative buff', () => {
			const buffs = game.player.find(TestingUnitNoEffect).buffs
			expect(buffs.has(TestingBuffDispellablePositive)).toEqual(true)
			expect(buffs.has(TestingBuffDispellableNegative)).toEqual(false)
		})
	})

	describe('when an ally has a negative and a positive buff', () => {
		beforeEach(() => {
			const buffs = game.player.summon(TestingUnitNoEffect).buffs
			buffs.add(TestingBuffDispellableNegative)
			buffs.add(TestingBuffDispellablePositive)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('only removes the negative buff', () => {
			const buffs = game.player.find(TestingUnitNoEffect).buffs
			expect(buffs.has(TestingBuffDispellablePositive)).toEqual(true)
			expect(buffs.has(TestingBuffDispellableNegative)).toEqual(false)
		})
	})

	describe('when an enemy has positive buff', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellablePositive)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('removes the buff from an enemy', () => {
			expect(game.opponent.find(TestingUnitNoEffect).buffs.has(TestingBuffDispellablePositive)).toEqual(false)
		})
	})

	describe('when an enemy has neutral buff', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellableNeutral)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('removes the buff from an enemy', () => {
			expect(game.opponent.find(TestingUnitNoEffect).buffs.has(TestingBuffDispellableNeutral)).toEqual(false)
		})
	})

	describe('when an enemy has negative buff', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitNoEffect).buffs.add(TestingBuffDispellableNegative)
			game.player.add(CardInTesting).play()
		})

		it('does not consider the enemy valid target', () => {
			expect(() => game.player.getStack().targetFirst()).toThrow()
		})
	})

	describe('when an enemy has a positive and a negative buff', () => {
		beforeEach(() => {
			const buffs = game.opponent.summon(TestingUnitNoEffect).buffs
			buffs.add(TestingBuffDispellablePositive)
			buffs.add(TestingBuffDispellableNegative)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('only removes the positive buff', () => {
			const buffs = game.opponent.find(TestingUnitNoEffect).buffs
			expect(buffs.has(TestingBuffDispellablePositive)).toEqual(false)
			expect(buffs.has(TestingBuffDispellableNegative)).toEqual(true)
		})
	})

	describe('when an enemy has a negative and a positive buff', () => {
		beforeEach(() => {
			const buffs = game.opponent.summon(TestingUnitNoEffect).buffs
			buffs.add(TestingBuffDispellableNegative)
			buffs.add(TestingBuffDispellablePositive)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('only removes the positive buff', () => {
			const buffs = game.opponent.find(TestingUnitNoEffect).buffs
			expect(buffs.has(TestingBuffDispellablePositive)).toEqual(false)
			expect(buffs.has(TestingBuffDispellableNegative)).toEqual(true)
		})
	})

	describe('when an ally has many buffs', () => {
		let addedBuffs: TestGameBuff[] = []

		beforeEach(() => {
			const buffs = game.player.summon(TestingUnitNoEffect).buffs
			addedBuffs = buffs.addMultiple(TestingBuffDispellableNegative, 3 + UnitCleansingFlame.DISPEL_POWER)
			game.player.add(CardInTesting).play().targetFirst()
		})

		it('only removes N latest buffs', () => {
			const buffs = game.player.find(TestingUnitNoEffect).buffs
			expect(buffs.hasExact(addedBuffs[0])).toEqual(true)
			expect(buffs.hasExact(addedBuffs[1])).toEqual(true)
			expect(buffs.hasExact(addedBuffs[2])).toEqual(true)
			expect(buffs.hasExact(addedBuffs[3])).toEqual(false)
			expect(buffs.hasExact(addedBuffs[4])).toEqual(false)
			expect(buffs.hasExact(addedBuffs[5])).toEqual(false)
			for (let i = 0; i < UnitCleansingFlame.DISPEL_POWER; i++) {
				expect(buffs.hasExact(addedBuffs[i + 3])).toEqual(false)
			}
		})
	})
})
