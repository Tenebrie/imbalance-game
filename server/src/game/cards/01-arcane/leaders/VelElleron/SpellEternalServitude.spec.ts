import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import SpellEternalServitude from './SpellEternalServitude'
import TestingUnitSinglePower from '../../../11-testing/TestingUnitSinglePower'
import BuffUnitToSpellConversion from '../../../../buffs/BuffUnitToSpellConversion'
import BuffLeaderPower from '../../../../buffs/BuffLeaderPower'
import CardLocation from '../../../../../../../shared/src/enums/CardLocation'

describe('SpellEternalServitude', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
		game.player.addSpellMana(10)
		game.player.spawn(TestingUnitSinglePower)
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
		expect(game.player.find(TestingUnitSinglePower).buffs.includes(BuffLeaderPower)).toBeTruthy()
		expect(game.player.find(TestingUnitSinglePower).buffs.includes(BuffUnitToSpellConversion)).toBeTruthy()
	})
})
