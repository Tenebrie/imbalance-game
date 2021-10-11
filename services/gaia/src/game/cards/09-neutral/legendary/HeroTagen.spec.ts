import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit1SplashUnitDamage from '../../11-testing/TestingUnit1SplashUnitDamage'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import HeroTagen from './HeroTagen'

const CardInTesting = HeroTagen

describe('HeroTagen', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played behind an ally', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(CardInTesting).playTo('middle', 'last')
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('does not deal damage to the ally', () => {
			expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
		})
	})

	describe('when played in front of many enemies', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage only to enemies in front', () => {
			expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 1).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 2).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 3).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 4).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 5).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 6).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 7).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 8).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 9).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 10).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 11).stats.power).toEqual(100)
		})
	})

	describe('when played in front of many enemies while offset', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'front')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.opponent.summon(TestingUnit100Power, 'back')
			game.player.summon(TestingUnitNoEffect)
			game.player.summon(TestingUnitNoEffect)
			game.player.add(CardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('deals damage only to enemies in front', () => {
			expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 1).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 2).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 3).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 4).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 5).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 6).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 7).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 8).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 9).stats.power).toEqual(100)
			expect(game.opponent.findAt(TestingUnit100Power, 10).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
			expect(game.opponent.findAt(TestingUnit100Power, 11).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE)
		})
	})

	describe('when played with extra splash unit damage', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnit100Power)
			game.player.summon(TestingUnit1SplashUnitDamage)
			game.player.add(CardInTesting).play()
		})

		it('respects the splash unit damage stat', () => {
			expect(game.opponent.findAt(TestingUnit100Power, 0).stats.power).toEqual(100 - HeroTagen.BASE_ENEMY_DAMAGE - 1)
		})
	})
})
