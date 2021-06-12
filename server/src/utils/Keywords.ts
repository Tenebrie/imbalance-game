import ServerCard from '../game/models/ServerCard'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import CardType from '@shared/enums/CardType'
import ServerBuff from '../game/models/buffs/ServerBuff'
import ServerAnimation from '../game/models/ServerAnimation'
import BuffUnitToSpellConversion from '../game/buffs/BuffUnitToSpellConversion'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import UnitShatteredSpace from '@src/game/cards/01-arcane/tokens/UnitShatteredSpace'
import Constants from '@shared/Constants'
import { EmptyFunction, toRowIndex } from './Utils'
import ServerUnit from '@src/game/models/ServerUnit'
import ServerOwnedCard from '@src/game/models/ServerOwnedCard'
import GameEventCreators from '@src/game/models/events/GameEventCreators'

const createCard = (player: ServerPlayerInGame, card: ServerCard, callback: (card: ServerCard) => void): ServerCard => {
	callback(card)
	card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, player))
	return card
}

const addCardToHand = (player: ServerPlayerInGame, card: ServerCard): ServerCard => {
	if (card.type === CardType.UNIT && !card.buffs.has(BuffUnitToSpellConversion)) {
		player.cardHand.addUnit(card)
	} else {
		player.cardHand.addSpell(card)
	}
	return card
}

export default {
	move: {
		unit: (unit: ServerUnit) => ({
			toPosition: (rowOrIndex: number | ServerBoardRow, unitIndex: number): void => {
				unit.game.board.moveUnit(unit, toRowIndex(rowOrIndex), unitIndex)
			},
		}),
	},

	summonCard: (card: ServerCard): void => {
		const cardOwner = card.ownerInGame
		if (cardOwner.cardDeck.allCards.includes(card)) {
			cardOwner.cardDeck.removeCard(card)
		} else if (cardOwner.cardGraveyard.allCards.includes(card)) {
			cardOwner.cardGraveyard.removeCard(card)
		}
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, cardOwner))
	},

	discardCard: (card: ServerCard): void => {
		const owner = card.ownerInGame
		owner.cardHand.discardCard(card)
		owner.cardGraveyard.addCard(card)
	},

	returnCard: (card: ServerCard): void => {
		const owner = card.ownerInGame
		owner.cardHand.discardCard(card)
		if (card.type === CardType.UNIT) {
			owner.cardDeck.addUnitToBottom(card)
		} else {
			owner.cardDeck.addSpellToBottom(card)
		}
		card.game.events.postEvent(
			GameEventCreators.cardReturned({
				game: card.game,
				owner: owner,
				triggeringCard: card,
			})
		)
	},

	destroy: {
		unit: (unit: ServerUnit) => ({
			withSource: (source: ServerCard) => {
				unit.game.animation.play(ServerAnimation.cardAffectsCards(source, [unit.card]))
				unit.game.board.destroyUnit(unit)
			},

			withoutSource: () => {
				unit.game.board.destroyUnit(unit)
			},
		}),
	},

	addCardToHand: {
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
				return addCardToHand(card.ownerInGame, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(card.game, instance)
				return addCardToHand(card.ownerInGame, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
				return addCardToHand(card.ownerInGame, newCard)
			},
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
				return addCardToHand(player, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(player.game, instance)
				return addCardToHand(player, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
				return addCardToHand(player, newCard)
			},
		}),
	},

	createCard: {
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
				return createCard(card.ownerInGame, newCard, EmptyFunction)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(card.game, instance)
				return createCard(card.ownerInGame, newCard, EmptyFunction)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
				return createCard(card.ownerInGame, newCard, EmptyFunction)
			},

			with: (callback: (card: ServerCard) => void) => ({
				fromClass: (cardClass: string): ServerCard => {
					const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
					return createCard(card.ownerInGame, newCard, callback)
				},

				fromInstance: (instance: ServerCard): ServerCard => {
					const newCard = CardLibrary.instantiateByInstance(card.game, instance)
					return createCard(card.ownerInGame, newCard, callback)
				},

				fromConstructor: (prototype: CardConstructor): ServerCard => {
					const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
					return createCard(card.ownerInGame, newCard, callback)
				},
			}),
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
				return createCard(player, newCard, EmptyFunction)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(player.game, instance)
				return createCard(player, newCard, EmptyFunction)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
				return createCard(player, newCard, EmptyFunction)
			},

			with: (callback: (card: ServerCard) => void) => ({
				fromClass: (cardClass: string): ServerCard => {
					const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
					return createCard(player, newCard, callback)
				},

				fromInstance: (instance: ServerCard): ServerCard => {
					const newCard = CardLibrary.instantiateByInstance(player.game, instance)
					return createCard(player, newCard, callback)
				},

				fromConstructor: (prototype: CardConstructor): ServerCard => {
					const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
					return createCard(player, newCard, callback)
				},
			}),
		}),
	},

	infuse: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		if (subscriber instanceof ServerBuff && subscriber.parent instanceof ServerBoardRow) {
			throw new Error('Trying to infuse a board row')
		}
		const card = subscriber instanceof ServerBuff ? (subscriber.parent as ServerCard) : subscriber
		const player = card.ownerInGame
		if (!player) {
			throw new Error('No owner for card')
		}
		const manaToDrain = typeof value === 'function' ? value() : value
		if (player.spellMana < manaToDrain) {
			throw new Error('Player does not have enough mana!')
		}
		player.addSpellMana(-manaToDrain)
		player.game.animation.play(ServerAnimation.cardInfuse(card))
	},

	generateMana: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		if (subscriber instanceof ServerBuff && subscriber.parent instanceof ServerBoardRow) {
			throw new Error('Trying to infuse a board row')
		}
		const card = subscriber instanceof ServerBuff ? (subscriber.parent as ServerCard) : subscriber
		const player = card.ownerInGame
		const manaToGenerate = typeof value === 'function' ? value() : value
		player.addSpellMana(manaToGenerate)
		player.game.animation.play(ServerAnimation.cardGenerateMana(card))
	},

	dispel: (count: number) => ({
		from: (targetCard: ServerCard | ServerUnit) => ({
			withSourceAs: (sourceCard: ServerCard) => {
				const card = targetCard instanceof ServerCard ? targetCard : targetCard.card
				targetCard.game.animation.play(ServerAnimation.cardAffectsCards(sourceCard, [card]))
				targetCard.buffs.dispel(count)
			},
		}),
	}),

	shatter: (count: number) => ({
		on: (targetRow: ServerBoardRow) => {
			for (let i = 0; i < count; i++) {
				targetRow.game.animation.thread(() => {
					const shatteredSpaceCount = targetRow.cards.filter((unit) => unit.card instanceof UnitShatteredSpace).length
					const unitIndex = shatteredSpaceCount % 2 === 0 ? 0 : Constants.MAX_CARDS_PER_ROW
					targetRow.createUnit(new UnitShatteredSpace(targetRow.game), unitIndex)
				})
			}
		},
	}),
}

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
