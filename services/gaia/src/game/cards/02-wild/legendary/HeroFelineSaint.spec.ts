import CardLocation from '@shared/enums/CardLocation'

import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import UnitStrayCat from '../../09-neutral/tokens/UnitStrayCat'
import HeroFelineSaint from './HeroFelineSaint'

describe('HeroFelineSaint', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when played', () => {
		beforeEach(() => {
			game.player.add(HeroFelineSaint).play()
		})

		it('creates the cards', () => {
			expect(game.stack.countAll()).toEqual(HeroFelineSaint.CATS_CREATED + 1)
		})

		it('created cards are cats', () => {
			expect(game.player.find(UnitStrayCat).location).toEqual(CardLocation.STACK)
		})
	})
})
