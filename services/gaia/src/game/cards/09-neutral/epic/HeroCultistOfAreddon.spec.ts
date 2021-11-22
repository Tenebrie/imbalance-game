import { setupTestGame, TestGame } from '../../../../utils/TestGame'
import CardLibrary from '../../../libraries/CardLibrary'
import { BuffMorningApathy } from '../../../models/buffs/ServerBuff'
import TestingRulesetPVP from '../../../rulesets/testing/TestingRulesetPVP'
import TestingUnitBronze from '../../11-testing/TestingUnitBronze'
import TestingUnitSilver from '../../11-testing/TestingUnitSilver'
import HeroCultistOfAreddon from './HeroCultistOfAreddon'

const cardInTesting = HeroCultistOfAreddon

describe('HeroCultistOfAreddon', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when no other units are present', () => {
		beforeEach(() => {
			game.player.add(cardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('creates the unit', () => {
			expect(game.board.count(cardInTesting)).toEqual(1)
		})
	})

	describe('when a bronze ally is present', () => {
		beforeEach(() => {
			CardLibrary.forceLoadCards([TestingUnitBronze])
			game.player.summon(TestingUnitBronze)
			game.player.add(cardInTesting).play().targetFirst().targetFirst()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})

		it('gives the ally apathy', () => {
			expect(game.board.find(TestingUnitBronze).buffs.has(BuffMorningApathy)).toEqual(true)
		})
	})

	describe('when a silver ally is present', () => {
		beforeEach(() => {
			game.player.summon(TestingUnitSilver)
			game.player.add(cardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})

	describe('when a bronze enemy is present', () => {
		beforeEach(() => {
			game.opponent.summon(TestingUnitBronze)
			game.player.add(cardInTesting).play()
		})

		it('resolves the card', () => {
			expect(game.stack.countAll()).toEqual(0)
		})
	})
})
