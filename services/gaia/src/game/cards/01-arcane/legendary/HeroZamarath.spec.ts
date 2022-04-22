import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import TestingRulesetPVP from '@src/game/rulesets/testing/TestingRulesetPVP'
import { setupTestGame, TestGame } from '@src/utils/TestGame'

import TestingSpellDeals100Damage from '../../11-testing/TestingSpellDeals100Damage'
import TestingUnitNoEffect from '../../11-testing/TestingUnitNoEffect'
import HeroZamarath from './HeroZamarath'

const CardInTesting = HeroZamarath

describe('HeroZamarath', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetPVP)
	})

	it('always has protector', () => {
		expect(game.player.add(HeroZamarath).handle.features.includes(CardFeature.PROTECTOR)).toBeTruthy()
	})

	it('gets untargetable when played', () => {
		game.player.add(CardInTesting).play()
		expect(game.player.find(CardInTesting).handle.location).toEqual(CardLocation.BOARD)
		expect(game.player.find(CardInTesting).handle.features.includes(CardFeature.UNTARGETABLE)).toBeTruthy()
	})

	it('intercepts damage and survives with immunity', () => {
		game.player.add(CardInTesting).play()
		game.player.summon(TestingUnitNoEffect, 'middle')

		game.opponent.add(TestingSpellDeals100Damage).play().targetLast()

		expect(game.player.find(TestingUnitNoEffect).stats.power).toEqual(20)
		expect(game.player.find(CardInTesting).stats.power).toEqual(24)
		expect(game.player.find(CardInTesting).stats.armor).toEqual(10)
	})

	it('intercepts damage and dies without immunity', () => {
		game.player.add(CardInTesting).play()
		game.player.summon(TestingUnitNoEffect, 'middle')
		game.opponent.endTurn()
		game.player.endTurn()

		game.opponent.add(TestingSpellDeals100Damage).play().targetLast()

		expect(game.player.find(TestingUnitNoEffect).stats.power).toEqual(20)
		expect(game.player.find(CardInTesting).stats.power).toEqual(0)
		expect(game.player.find(CardInTesting).stats.armor).toEqual(0)
	})
})
