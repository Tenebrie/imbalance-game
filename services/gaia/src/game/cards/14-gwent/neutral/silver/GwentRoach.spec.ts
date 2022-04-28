import CardLocation from '@shared/enums/CardLocation'
import TestingUnitGolden from '@src/game/cards/11-testing/TestingUnitGolden'
import TestingUnitSilver from '@src/game/cards/11-testing/TestingUnitSilver'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import GwentDandelionPoet from '../golden/GwentDandelionPoet'
import GwentRoach from './GwentRoach'
import GwentSarah from './GwentSarah'

describe('GwentRoach', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
	})

	describe('when a golden unit is played from hand', () => {
		beforeEach(() => {
			game.player.deck.add(GwentRoach)
			game.player.add(TestingUnitGolden).play()
		})

		it('summons Roach to the board', () => {
			expect(game.player.find(GwentRoach).location).toEqual(CardLocation.BOARD)
		})
	})

	describe('when a silver unit is played from hand', () => {
		beforeEach(() => {
			game.player.deck.add(GwentRoach)
			game.player.add(TestingUnitSilver).play()
		})

		it('does not summon Roach to the board', () => {
			expect(game.player.find(GwentRoach).location).toEqual(CardLocation.DECK)
		})
	})

	describe('Dandelion -> Sarah -> Roach bamboozle', () => {
		beforeEach(() => {
			game.player.add(TestingUnitSilver)
			game.player.deck.add(GwentSarah)
			game.player.deck.add(GwentRoach)
			game.player.add(GwentDandelionPoet).play().targetFirst().targetFirst()
		})

		it('summons Roach to the board', () => {
			expect(game.player.find(GwentRoach).location).toEqual(CardLocation.BOARD)
		})
	})
})
