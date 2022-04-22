import CardLocation from '../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import { isCardPublic } from '../../../../utils/Utils'
import BuffProtector from '../../../buffs/BuffProtector'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import HeroAntoria from './HeroAntoria'

const CardInTesting = HeroAntoria

describe('HeroAntoria', () => {
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
		describe('when an ally is attacked', () => {
			beforeEach(() => {
				game.player.summon(CardInTesting)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})
	})

	describe('in hand', () => {
		describe('when an ally is attacked', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
			})

			it('takes damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor - 1)
			})

			it('protects an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})

		describe('when an ally is attacked twice', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				const enemyCard = game.opponent.summon(TestingUnitNoEffect)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, enemyCard).takeDamageFromCard(1, enemyCard)
			})

			it('takes damage only once', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor - 1)
			})

			it('protects an ally from damage only once', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when an ally takes damage from universe', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power).takeDamage(1)
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when an ally takes damage from another ally', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, game.player.summon(TestingUnitNoEffect))
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when an ally takes damage from itself', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, game.player.find(TestingUnit100Power))
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when an enemy takes damage from another enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.opponent.summon(TestingUnit100Power).takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect the target from damage', () => {
				expect(game.opponent.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when an enemy takes damage from an ally', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.opponent.summon(TestingUnit100Power).takeDamageFromCard(1, game.player.summon(TestingUnitNoEffect))
			})

			it('does not take damage', () => {
				const card = game.player.find(CardInTesting)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect the target from damage', () => {
				expect(game.opponent.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})

		describe('when Antoria receives lethal damage', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				const enemyCard = game.opponent.summon(TestingUnitNoEffect)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(100, enemyCard)
			})

			it('gets moved to graveyard', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.GRAVEYARD)
			})

			it('protects an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})

		describe('when multiple copies of Antoria are present', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.add(CardInTesting)
				game.player.add(CardInTesting)
				game.player.add(CardInTesting)
				game.player.add(CardInTesting)
				const enemyCard = game.opponent.summon(TestingUnitNoEffect)
				game.player.summon(TestingUnit100Power).takeDamageFromCard(1, enemyCard)
			})

			it('only first copy takes damage', () => {
				const baseArmor = game.player.find(CardInTesting).stats.baseArmor
				expect(game.player.findAtGameIndex(CardInTesting, 0).stats.armor).toEqual(baseArmor - 1)
				expect(game.player.findAtGameIndex(CardInTesting, 1).stats.armor).toEqual(baseArmor)
				expect(game.player.findAtGameIndex(CardInTesting, 2).stats.armor).toEqual(baseArmor)
				expect(game.player.findAtGameIndex(CardInTesting, 3).stats.armor).toEqual(baseArmor)
				expect(game.player.findAtGameIndex(CardInTesting, 4).stats.armor).toEqual(baseArmor)
			})

			it('protects an ally from damage', () => {
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})
	})
})
