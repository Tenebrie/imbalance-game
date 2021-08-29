import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitPrototypeScorpionCrew from './UnitPrototypeScorpionCrew'

describe('UnitPrototypeScorpionCrew', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	it('deals damage on order', () => {
		const enemy = game.opponent.spawn(TestingUnitNoEffect)

		const unit = game.player.spawn(UnitPrototypeScorpionCrew)
		unit.orderOnFirst()
		expect(enemy.stats.power).toBe(enemy.stats.basePower - (unit.variables['targetDamage'] as number))
	})

	it('damages self on order', () => {
		game.opponent.spawn(TestingUnitNoEffect)
		const unit = game.player.spawn(UnitPrototypeScorpionCrew)
		unit.orderOnFirst()
		expect(unit.stats.power).toBe(unit.stats.basePower + unit.stats.baseArmor - (unit.variables['selfDamage'] as number))
		expect(unit.stats.armor).toBe(unit.stats.baseArmor - (unit.variables['selfDamage'] as number))
	})

	it('can attack multiple times', () => {
		const enemy = game.opponent.spawn(TestingUnitNoEffect)

		const unit = game.player.spawn(UnitPrototypeScorpionCrew)
		unit.orderOnFirst()
		unit.orderOnFirst()
		unit.orderOnFirst()
		expect(enemy.stats.power).toBe(enemy.stats.basePower - (unit.variables['targetDamage'] as number) * 3)
	})
})
