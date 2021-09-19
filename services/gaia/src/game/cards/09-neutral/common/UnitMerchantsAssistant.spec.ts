import TestGameTemplates from '../../../../utils/TestGameTemplates'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import TestingSpell10Mana from '../../11-testing/TestingSpell10Mana'
import UnitMerchantsAssistant from './UnitMerchantsAssistant'

describe('UnitMerchantsAssistant', () => {
	let game: ServerGame
	let cardInHand: ServerCard
	let player: ServerPlayerInGame
	let startNextRound: () => void
	let playerAction: (callback: () => void) => void

	beforeEach(() => {
		;({ game, cardInHand, player, startNextRound, playerAction } = TestGameTemplates.singleCardTest(UnitMerchantsAssistant))
	})

	it('makes existing spells in hand cheaper', () => {
		player.cardHand.addSpell(new TestingSpell10Mana(game))
		player.cardHand.addSpell(new TestingSpell10Mana(game))
		player.cardHand.addSpell(new TestingSpell10Mana(game))

		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})

		expect(player.cardHand.spellCards[0].stats.spellCost).toEqual(7)
		expect(player.cardHand.spellCards[1].stats.spellCost).toEqual(7)
		expect(player.cardHand.spellCards[2].stats.spellCost).toEqual(7)
	})

	it('makes spells cheaper when they get into the hand', () => {
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})

		playerAction(() => {
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
		})

		expect(player.cardHand.spellCards[0].stats.spellCost).toEqual(7)
		expect(player.cardHand.spellCards[1].stats.spellCost).toEqual(7)
		expect(player.cardHand.spellCards[2].stats.spellCost).toEqual(7)
	})

	it('removes discount after a spell is played', () => {
		playerAction(() => {
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
		})
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(player.cardHand.spellCards[0], player), 0, 0)
		})

		expect(player.cardHand.spellCards[0].stats.spellCost).toEqual(10)
		expect(player.cardHand.spellCards[1].stats.spellCost).toEqual(10)
	})

	it('removes discount on the next round', () => {
		playerAction(() => {
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
			player.cardHand.addSpell(new TestingSpell10Mana(game))
		})
		playerAction(() => {
			game.cardPlay.playCardFromHand(new ServerOwnedCard(cardInHand, player), 0, 0)
		})

		startNextRound()

		expect(player.cardHand.spellCards[0].stats.spellCost).toEqual(10)
		expect(player.cardHand.spellCards[1].stats.spellCost).toEqual(10)
		expect(player.cardHand.spellCards[2].stats.spellCost).toEqual(10)
	})
})
