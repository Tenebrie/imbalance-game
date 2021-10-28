import CardLocation from '../../../../../../../../shared/src/enums/CardLocation'
import { setupTestGame, TestGame } from '../../../../../utils/TestGame'
import TestingRulesetPVP from '../../../../rulesets/testing/TestingRulesetPVP'
import TestingUnit5PowerVoidspawn from '../../../11-testing/TestingUnit5PowerVoidspawn'
import TestingUnit100PowerVoidspawn from '../../../11-testing/TestingUnit100PowerVoidspawn'
import HeroDraconicRift from './HeroDraconicRift'
import HeroFormidia from './HeroFormidia'
import HeroFormidiaShade from './HeroFormidiaShade'

const CardInTesting = HeroDraconicRift

describe('HeroDraconicRift', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	describe('when turn ends without allies to consume', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.endTurn()
		})

		it('does not do anything', () => {
			expect(game.board.count(CardInTesting)).toEqual(1)
			expect(game.board.countAll()).toEqual(1)
		})
	})

	describe('when turn ends with a weak ally to consume', () => {
		beforeEach(() => {
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.endTurn()
		})

		it('destroys the ally', () => {
			expect(game.board.count(CardInTesting)).toEqual(1)
			expect(game.board.count(TestingUnit5PowerVoidspawn)).toEqual(0)
		})

		it('gains bonus power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + 5)
		})
	})

	describe('when turn ends with multiple allies to consume', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100PowerVoidspawn)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnit5PowerVoidspawn)
			game.player.summon(TestingUnit100PowerVoidspawn)
			game.player.endTurn()
		})

		it('destroys adjacent allies once', () => {
			expect(game.board.count(CardInTesting)).toEqual(1)
			expect(game.board.count(TestingUnit5PowerVoidspawn)).toEqual(0)
			expect(game.board.count(TestingUnit100PowerVoidspawn)).toEqual(2)
		})

		it('gains bonus power', () => {
			const card = game.player.find(CardInTesting)
			expect(card.stats.power).toEqual(card.stats.basePower + 10)
		})
	})

	describe('when consumes enough power', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100PowerVoidspawn)
			game.player.summon(CardInTesting)
			game.player.summon(TestingUnit100PowerVoidspawn)
			game.player.endTurn()
		})

		it('destroys itself', () => {
			expect(game.board.count(CardInTesting)).toEqual(0)
		})

		it('summons the dragon', () => {
			expect(game.board.count(HeroFormidia)).toEqual(1)
		})

		it('adds the shade to hand', () => {
			expect(() => game.player.find(HeroFormidiaShade)).not.toThrow()
			expect(game.player.find(HeroFormidiaShade).location).toEqual(CardLocation.HAND)
		})
	})
})
