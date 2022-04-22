import Constants from '@shared/Constants'
import CardTribe from '@shared/enums/CardTribe'
import TestingSpellDeals100Damage from '@src/game/cards/11-testing/TestingSpellDeals100Damage'
import TestingSpellGolden from '@src/game/cards/11-testing/TestingSpellGolden'
import TestingSpellOrganic1Damage from '@src/game/cards/11-testing/TestingSpellOrganic1Damage'
import TestingSpellOrganic2Damage from '@src/game/cards/11-testing/TestingSpellOrganic2Damage'
import TestingSpellOrganic3Damage from '@src/game/cards/11-testing/TestingSpellOrganic3Damage'
import TestingSpellOrganic4Damage from '@src/game/cards/11-testing/TestingSpellOrganic4Damage'
import TestingSpellOrganic5Damage from '@src/game/cards/11-testing/TestingSpellOrganic5Damage'
import TestingSpellOrganicSilver1Damage from '@src/game/cards/11-testing/TestingSpellOrganicSilver1Damage'
import TestingUnit100Power from '@src/game/cards/11-testing/TestingUnit100Power'
import TestingUnitNoEffect from '@src/game/cards/11-testing/TestingUnitNoEffect'
import CardLibrary from '@src/game/libraries/CardLibrary'
import TestingRulesetGwent from '@src/game/rulesets/testing/TestingRulesetGwent'
import { setupTestGame, TestGame } from '@src/utils/TestGame'
import { getClassFromConstructor } from '@src/utils/Utils'

import GwentWhisperingHillock from './GwentWhisperingHillock'

describe('GwentWhisperingHillock', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwent)
		CardLibrary.forceLoadCards([
			TestingSpellOrganic1Damage,
			TestingSpellOrganic2Damage,
			TestingSpellOrganic3Damage,
			TestingSpellOrganic4Damage,
			TestingSpellOrganic5Damage,
			TestingSpellOrganicSilver1Damage,
			TestingSpellDeals100Damage,
			TestingSpellGolden,
			TestingUnitNoEffect,
			TestingUnit100Power,
		])
	})

	describe('when played from hand', () => {
		beforeEach(() => {
			game.player.add(GwentWhisperingHillock).play()
		})

		it(`shows ${Constants.CREATE_KEYWORD_CARD_COUNT} options`, () => {
			expect(game.player.getStack().countOptions()).toEqual(Constants.CREATE_KEYWORD_CARD_COUNT)
		})

		it(`only shows organic cards`, () => {
			expect(
				game.player
					.getStack()
					.targetCards()
					.every((card) => card.tribes.includes(CardTribe.ORGANIC))
			).toBeTruthy()
		})

		it(`only shows bronze and silver`, () => {
			expect(
				game.player
					.getStack()
					.targetCards()
					.every((card) => card.isBronzeOrSilver)
			).toBeTruthy()
		})
	})

	describe('when card is selected', () => {
		beforeEach(() => {
			game.player.add(GwentWhisperingHillock).play().targetFirst()
		})

		it(`plays a card`, () => {
			expect(game.stack.countAll()).toEqual(2)
		})

		it(`plays one of the allowed cards`, () => {
			const validClasses = [
				TestingSpellOrganic1Damage,
				TestingSpellOrganic2Damage,
				TestingSpellOrganic3Damage,
				TestingSpellOrganic4Damage,
				TestingSpellOrganic5Damage,
				TestingSpellOrganicSilver1Damage,
			].map((constructor) => getClassFromConstructor(constructor))
			expect(validClasses.includes(game.player.getStack().topCard().card.class)).toBeTruthy()
		})
	})
})
