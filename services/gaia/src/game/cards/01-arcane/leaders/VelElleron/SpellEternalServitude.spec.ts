import CardLocation from '@shared/enums/CardLocation'

import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import BuffLeaderPower from '../../../../buffs/BuffLeaderPower'
import BuffUnitToSpellConversion from '../../../../buffs/BuffUnitToSpellConversion'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitSinglePower from '../../../11-testing/TestingUnitSinglePower'
import SpellEternalServitude from './SpellEternalServitude'

describe('SpellEternalServitude', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
		game.player.addSpellMana(10)
		game.player.summon(TestingUnitSinglePower)
		game.player.add(SpellEternalServitude).play().targetFirst()
	})

	it('resolves the card', () => {
		expect(game.stack.countAll()).toEqual(0)
	})

	it('destroys allied unit', () => {
		expect(game.board.countAll()).toEqual(0)
	})

	it('moves the card to spell deck', () => {
		expect(game.player.find(TestingUnitSinglePower).location).toEqual(CardLocation.DECK)
	})

	it('applies the buffs', () => {
		expect(game.player.find(TestingUnitSinglePower).buffs.has(BuffLeaderPower)).toBeTruthy()
		expect(game.player.find(TestingUnitSinglePower).buffs.has(BuffUnitToSpellConversion)).toBeTruthy()
	})
})
