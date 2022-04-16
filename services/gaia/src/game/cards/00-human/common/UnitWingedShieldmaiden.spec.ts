import Constants from '@shared/Constants'
import CardLocation from '@shared/enums/CardLocation'

import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import { isCardPublic } from '../../../../utils/Utils'
import BuffProtector from '../../../buffs/BuffProtector'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit100Power from '../../11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import UnitWingedShieldmaiden from './UnitWingedShieldmaiden'

const CardInTesting = UnitWingedShieldmaiden

describe('UnitWingedShieldmaiden', () => {
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
		beforeEach(() => {
			game.player.summon(CardInTesting, 'front')
			game.player.summon(TestingUnit100Power, 'back').takeDamage(100)
		})

		it('does not trigger', () => {
			expect(game.player.find(CardInTesting).getUnit().getRowDistance()).toEqual('front')
		})

		it('does not prevent target death', () => {
			expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.GRAVEYARD)
		})
	})

	describe('in hand', () => {
		describe('when an ally on the back row takes minor damage from an enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power, 'back').takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
			})

			it('plays itself in front of target', () => {
				const card = game.player.find(CardInTesting)
				expect(card.getUnit().getRowDistance()).toEqual('middle')
				expect(card.stats.power).toEqual(card.stats.basePower)
				expect(card.stats.armor).toEqual(card.stats.baseArmor - 1)
			})

			it('protects target from damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.BOARD)
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})

		describe('when an ally on the back row takes fatal damage from an enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power, 'back').takeDamageFromCard(100, game.opponent.summon(TestingUnitNoEffect))
			})

			it('gets destroyed', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.GRAVEYARD)
			})

			it('protects target from damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.BOARD)
			})
		})

		describe('when an ally on the front row takes damage from an enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnit100Power, 'front').takeDamageFromCard(100, game.opponent.summon(TestingUnitNoEffect))
			})

			it('does not trigger', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.HAND)
			})

			it('does not prevent target death', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.GRAVEYARD)
			})
		})

		describe('when an ally behind a full row takes damage from an enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
					game.player.summon(TestingUnitNoEffect, 'middle')
				}
				game.player.summon(TestingUnit100Power, 'back').takeDamageFromCard(100, game.opponent.summon(TestingUnitNoEffect))
			})

			it('does not trigger', () => {
				expect(game.player.find(CardInTesting).location).toEqual(CardLocation.HAND)
			})

			it('does not prevent target death', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.GRAVEYARD)
			})
		})

		describe('when an ally takes damage from an enemy when front row is not empty', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnit100Power, 'middle').takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
			})

			it('plays itself in front of target', () => {
				const card = game.player.find(CardInTesting)
				expect(card.getUnit().getRowDistance()).toEqual('front')
				expect(card.getUnit().getRowPosition()).toEqual(1)
				expect(card.stats.armor).toEqual(card.stats.baseArmor - 1)
			})

			it('protects target from damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.BOARD)
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})

		describe('when an ally on a full row takes damage from an enemy', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summon(TestingUnitNoEffect, 'front')
				game.player.summonMany(TestingUnitNoEffect, 5, 'middle')
				game.player.summon(TestingUnit100Power, 'middle').takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
				game.player.summonMany(TestingUnitNoEffect, 5, 'middle')
			})

			it('plays itself in front of target', () => {
				const card = game.player.find(CardInTesting)
				expect(card.getUnit().getRowDistance()).toEqual('front')
				expect(card.getUnit().getRowPosition()).toEqual(5)
				expect(card.stats.armor).toEqual(card.stats.baseArmor - 1)
			})

			it('protects target from damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.BOARD)
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(100)
			})
		})

		describe('when an ally on a full row takes damage from an enemy while front row is empty', () => {
			beforeEach(() => {
				game.player.add(CardInTesting)
				game.player.summon(TestingUnitNoEffect, 'front')

				game.player.summonMany(TestingUnitNoEffect, 5, 'middle')
				game.player.summon(TestingUnit100Power, 'middle').takeDamageFromCard(1, game.opponent.summon(TestingUnitNoEffect))
				game.player.summonMany(TestingUnitNoEffect, 5, 'middle')
			})

			it('plays itself in front of target', () => {
				const card = game.player.find(CardInTesting)
				expect(card.getUnit().getRowDistance()).toEqual('front')
				expect(card.getUnit().getRowPosition()).toEqual(1)
				expect(card.stats.armor).toEqual(card.stats.baseArmor)
			})

			it('does not protect from damage', () => {
				expect(game.player.find(TestingUnit100Power).location).toEqual(CardLocation.BOARD)
				expect(game.player.find(TestingUnit100Power).stats.power).toEqual(99)
			})
		})
	})
})
