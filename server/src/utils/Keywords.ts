import Constants from '@shared/Constants'
import CardType from '@shared/enums/CardType'
import UnitShatteredSpace from '@src/game/cards/01-arcane/tokens/UnitShatteredSpace'
import GameEventCreators from '@src/game/models/events/GameEventCreators'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerOwnedCard from '@src/game/models/ServerOwnedCard'
import ServerUnit from '@src/game/models/ServerUnit'

import BuffUnitToSpellConversion from '../game/buffs/BuffUnitToSpellConversion'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerBuff from '../game/models/buffs/ServerBuff'
import ServerAnimation from '../game/models/ServerAnimation'
import ServerCard from '../game/models/ServerCard'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import { EmptyFunction, getOwnerPlayer, toRowIndex } from './Utils'

const createCard = (player: ServerPlayerInGame | null, card: ServerCard, callback: (card: ServerCard) => void): ServerCard => {
	if (!player) {
		throw new Error('Trying to create card for null player')
	}

	callback(card)
	card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, player))
	return card
}

const addCardToHand = (player: ServerPlayerInGame | null, card: ServerCard): ServerCard => {
	if (!player) {
		throw new Error('Trying to add card to null player')
	}

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

	draw: {
		topUnitCard: (player: ServerPlayerInGame): void => {
			const card = player.cardDeck.drawTopUnit()
			if (!card) {
				return
			}
			player.cardHand.addUnit(card)
		},
	},

	summonCard: (card: ServerCard): void => {
		const cardOwner = card.ownerPlayer
		if (cardOwner.cardDeck.allCards.includes(card)) {
			cardOwner.cardDeck.removeCard(card)
		} else if (cardOwner.cardGraveyard.allCards.includes(card)) {
			cardOwner.cardGraveyard.removeCard(card)
		}
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, cardOwner))
	},

	discardCard: (card: ServerCard): void => {
		const owner = card.ownerPlayer
		owner.cardHand.discardCard(card)
		owner.cardGraveyard.addCard(card)
	},

	returnCardToDeck: (card: ServerCard): void => {
		const owner = card.ownerPlayer
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

	transformUnit: (unit: ServerUnit | null | undefined, targetCard: CardConstructor): void => {
		if (!unit) {
			return
		}
		const rowIndex = unit.rowIndex
		const unitIndex = unit.unitIndex
		unit.game.board.removeUnit(unit)
		unit.game.board.createUnit(CardLibrary.instantiate(unit.game, targetCard), unit.originalOwner, rowIndex, unitIndex)
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

	addCardToDeck: (player: ServerPlayerInGame, card: CardConstructor): void => {
		const instance = new card(player.game)
		if (instance.type === CardType.UNIT) {
			player.cardDeck.addUnitToBottom(instance)
		} else {
			player.cardDeck.addSpellToBottom(instance)
		}
	},

	addCardToHand: {
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(card.game, cardClass)
				return addCardToHand(getOwnerPlayer(card), newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(card.game, instance)
				return addCardToHand(getOwnerPlayer(card), newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiate(card.game, prototype)
				return addCardToHand(getOwnerPlayer(card), newCard)
			},
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(player.game, cardClass)
				return addCardToHand(player, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(player.game, instance)
				return addCardToHand(player, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiate(player.game, prototype)
				return addCardToHand(player, newCard)
			},
		}),
	},

	createCard: {
		fromExisting: (card: ServerCard, owner: ServerPlayerInGame) => {
			card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, owner))
		},
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(card.game, cardClass)
				return createCard(card.ownerPlayerNullable, newCard, EmptyFunction)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(card.game, instance)
				return createCard(card.ownerPlayerNullable, newCard, EmptyFunction)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiate(card.game, prototype)
				return createCard(card.ownerPlayerNullable, newCard, EmptyFunction)
			},

			with: (callback: (card: ServerCard) => void) => ({
				fromClass: (cardClass: string): ServerCard => {
					const newCard = CardLibrary.instantiateFromClass(card.game, cardClass)
					return createCard(card.ownerPlayerNullable, newCard, callback)
				},

				fromInstance: (instance: ServerCard): ServerCard => {
					const newCard = CardLibrary.instantiateFromInstance(card.game, instance)
					return createCard(card.ownerPlayerNullable, newCard, callback)
				},

				fromConstructor: (prototype: CardConstructor): ServerCard => {
					const newCard = CardLibrary.instantiate(card.game, prototype)
					return createCard(card.ownerPlayerNullable, newCard, callback)
				},
			}),
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(player.game, cardClass)
				return createCard(player, newCard, EmptyFunction)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(player.game, instance)
				return createCard(player, newCard, EmptyFunction)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiate(player.game, prototype)
				return createCard(player, newCard, EmptyFunction)
			},

			with: (callback: (card: ServerCard) => void) => ({
				fromClass: (cardClass: string): ServerCard => {
					const newCard = CardLibrary.instantiateFromClass(player.game, cardClass)
					return createCard(player, newCard, callback)
				},

				fromInstance: (instance: ServerCard): ServerCard => {
					const newCard = CardLibrary.instantiateFromInstance(player.game, instance)
					return createCard(player, newCard, callback)
				},

				fromConstructor: (prototype: CardConstructor): ServerCard => {
					const newCard = CardLibrary.instantiate(player.game, prototype)
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
		const player = getOwnerPlayer(subscriber)!
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
		const player = getOwnerPlayer(subscriber)!
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

	shatter: (count: number, owner: ServerPlayerInGame) => ({
		on: (targetRow: ServerBoardRow) => {
			for (let i = 0; i < count; i++) {
				targetRow.game.animation.thread(() => {
					const shatteredSpaceCount = targetRow.cards.filter((unit) => unit.card instanceof UnitShatteredSpace).length
					const unitIndex = shatteredSpaceCount % 2 === 0 ? 0 : Constants.MAX_CARDS_PER_ROW
					targetRow.createUnit(new UnitShatteredSpace(targetRow.game), owner, unitIndex)
				})
			}
		},
	}),
}

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
