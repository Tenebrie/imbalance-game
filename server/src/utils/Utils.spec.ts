import TestGameTemplates from './TestGameTemplates'
import TestingUnitNoEffect from '../game/cards/11-testing/TestingUnitNoEffect'
import ServerGame from '../game/models/ServerGame'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import { getOwnerGroup, getOwnerPlayer } from './Utils'
import TestingSpellNoEffect from '../game/cards/11-testing/TestingSpellNoEffect'

describe('Utils', () => {
	describe('getOwnerPlayer', () => {
		let game: ServerGame
		let player: ServerPlayerInGame

		beforeEach(() => {
			;({ game, player } = TestGameTemplates.singleCardTest(TestingUnitNoEffect))
		})

		it('finds owner for a card in unit hand', () => {
			player.cardHand.addUnit(new TestingUnitNoEffect(game))
			const cardInHand = player.cardHand.unitCards[0]
			expect(getOwnerPlayer(cardInHand)).toEqual(player)
		})

		it('finds owner for a card in spell hand', () => {
			player.cardHand.addSpell(new TestingSpellNoEffect(game))
			const cardInHand = player.cardHand.spellCards[0]
			expect(getOwnerPlayer(cardInHand)).toEqual(player)
		})

		it('finds owner for a card in unit deck', () => {
			player.cardDeck.addUnitToBottom(new TestingUnitNoEffect(game))
			const cardInDeck = player.cardDeck.unitCards[0]
			expect(getOwnerPlayer(cardInDeck)).toEqual(player)
		})

		it('finds owner for a card in spell deck', () => {
			player.cardDeck.addSpellToBottom(new TestingSpellNoEffect(game))
			const cardInDeck = player.cardDeck.spellCards[0]
			expect(getOwnerPlayer(cardInDeck)).toEqual(player)
		})

		it('finds owner for a card in unit graveyard', () => {
			player.cardGraveyard.addUnit(new TestingUnitNoEffect(game))
			const cardInGraveyard = player.cardGraveyard.unitCards[0]
			expect(getOwnerPlayer(cardInGraveyard)).toEqual(player)
		})

		it('finds owner for a card in spell graveyard', () => {
			player.cardGraveyard.addSpell(new TestingSpellNoEffect(game))
			const cardInGraveyard = player.cardGraveyard.spellCards[0]
			expect(getOwnerPlayer(cardInGraveyard)).toEqual(player)
		})

		it('finds owner for a unit on board', () => {
			const unit = game.board.createUnit(new TestingUnitNoEffect(game), player, 0, 0)!
			expect(getOwnerPlayer(unit)).toEqual(player)
		})
	})

	describe('getOwnerGroup', () => {
		let game: ServerGame
		let player: ServerPlayerInGame

		beforeEach(() => {
			;({ game, player } = TestGameTemplates.singleCardTest(TestingUnitNoEffect))
		})

		it('finds owner for a card in unit hand', () => {
			player.cardHand.addUnit(new TestingUnitNoEffect(game))
			const cardInHand = player.cardHand.unitCards[0]
			expect(getOwnerGroup(cardInHand)).toEqual(player.group)
		})

		it('finds owner for a card in spell hand', () => {
			player.cardHand.addSpell(new TestingSpellNoEffect(game))
			const cardInHand = player.cardHand.spellCards[0]
			expect(getOwnerGroup(cardInHand)).toEqual(player.group)
		})

		it('finds owner for a card in unit deck', () => {
			player.cardDeck.addUnitToBottom(new TestingUnitNoEffect(game))
			const cardInDeck = player.cardDeck.unitCards[0]
			expect(getOwnerGroup(cardInDeck)).toEqual(player.group)
		})

		it('finds owner for a card in spell deck', () => {
			player.cardDeck.addSpellToBottom(new TestingSpellNoEffect(game))
			const cardInDeck = player.cardDeck.spellCards[0]
			expect(getOwnerGroup(cardInDeck)).toEqual(player.group)
		})

		it('finds owner for a card in unit graveyard', () => {
			player.cardGraveyard.addUnit(new TestingUnitNoEffect(game))
			const cardInGraveyard = player.cardGraveyard.unitCards[0]
			expect(getOwnerGroup(cardInGraveyard)).toEqual(player.group)
		})

		it('finds owner for a card in spell graveyard', () => {
			player.cardGraveyard.addSpell(new TestingSpellNoEffect(game))
			const cardInGraveyard = player.cardGraveyard.spellCards[0]
			expect(getOwnerGroup(cardInGraveyard)).toEqual(player.group)
		})

		it('finds owner for a unit on board', () => {
			const unit = game.board.createUnit(new TestingUnitNoEffect(game), player, 0, 0)!
			expect(getOwnerGroup(unit)).toEqual(player.group)
		})
	})
})
