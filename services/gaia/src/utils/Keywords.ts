import Constants from '@shared/Constants'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import BuffGwentExtraConsumePower from '@src/game/buffs/14-gwent/BuffGwentExtraConsumePower'
import BuffGwentLock from '@src/game/buffs/14-gwent/BuffGwentLock'
import BuffStrength from '@src/game/buffs/BuffStrength'
import UnitShatteredSpace from '@src/game/cards/01-arcane/tokens/UnitShatteredSpace'
import GameEventCreators, { GameEvent } from '@src/game/models/events/GameEventCreators'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import { AnimationThreadType } from '@src/game/models/ServerGameAnimation'
import ServerOwnedCard from '@src/game/models/ServerOwnedCard'
import ServerUnit from '@src/game/models/ServerUnit'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'

import BuffUnitToSpellConversion from '../game/buffs/BuffUnitToSpellConversion'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerBuff from '../game/models/buffs/ServerBuff'
import ServerAnimation from '../game/models/ServerAnimation'
import ServerCard from '../game/models/ServerCard'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import { EmptyFunction, getConstructorFromCard, getOwnerPlayer, toRowIndex } from './Utils'

const createCard = (player: ServerPlayerInGame | null, card: ServerCard, callback: (card: ServerCard) => void): ServerCard => {
	if (!player) {
		throw new Error('Trying to create card for null player')
	}

	callback(card)
	card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, player), 'aether')
	return card
}

const addCardToHand = (player: ServerPlayerInGame | null, card: ServerCard, options: Partial<AddCardToHandOptions>): ServerCard => {
	if (!player) {
		throw new Error('Trying to add card to null player')
	}

	if (card.type === CardType.UNIT && !card.buffs.has(BuffUnitToSpellConversion)) {
		player.cardHand.addUnit(card, {
			reveal: options.reveal || false,
		})
	} else {
		player.cardHand.addSpell(card, {
			reveal: options.reveal || false,
		})
	}
	return card
}

type AddCardToHandOptions = {
	reveal: boolean
}

const Keywords = {
	moveUnit: (unit: ServerUnit, rowOrIndex: number | ServerBoardRow, unitIndex: number): void => {
		unit.game.board.moveUnit(unit, toRowIndex(rowOrIndex), unitIndex)
	},

	draw: {
		topUnitCard: (player: ServerPlayerInGame): ServerCard | null => {
			const card = player.cardDeck.drawTopUnit()
			if (!card) {
				return null
			}
			player.cardHand.addUnit(card)

			player.game.events.postEvent(
				GameEventCreators.cardDrawn({
					game: player.game,
					owner: player,
					triggeringCard: card,
				})
			)
			return card
		},
	},

	drawExactCard: (player: ServerPlayerInGame, card: ServerCard): ServerCard => {
		player.cardDeck.removeCard(card)
		player.cardHand.addUnitCardAsDraw(card)
		player.cardHand.addUnit(card)
		return card
	},

	summonUnitFromHand: (args: {
		card: ServerCard
		owner: ServerPlayerInGame
		rowIndex: number
		unitIndex: number
		threadType?: AnimationThreadType
	}): ServerUnit | null => {
		const { card, owner, rowIndex, unitIndex } = args
		const threadType = args.threadType || 'sync'

		const game = owner.game
		return game.animation.smartThread(threadType, () => {
			owner.cardHand.removeCard(card)
			const unit = game.board.createUnit(card, owner, rowIndex, unitIndex)
			if (!unit) {
				owner.cardHand.addUnit(card)
			}
			return unit
		})
	},

	summonUnit: (args: {
		owner: ServerPlayerInGame
		cardConstructor: CardConstructor
		rowIndex: number
		unitIndex: number
		count?: number | LeaderStatValueGetter
		threadType?: AnimationThreadType
	}): ServerUnit | null => {
		const { owner, cardConstructor, rowIndex, unitIndex } = args
		const threadType = args.threadType || 'sync'

		const game = owner.game
		return game.animation.smartThread(threadType, () => {
			const card = new cardConstructor(game)
			return game.board.createUnit(card, owner, rowIndex, unitIndex)
		})
	},

	summonMultipleUnits: (args: {
		owner: ServerPlayerInGame
		cardConstructor: CardConstructor
		rowIndex: number
		unitIndex: number
		count: number | LeaderStatValueGetter
	}): ServerUnit[] => {
		const { owner, cardConstructor, rowIndex, unitIndex, count } = args
		const normalizedCount = count === undefined ? 1 : typeof count === 'function' ? count(owner.group) : count

		const game = owner.game

		const units: ServerUnit[] = []
		for (let i = 0; i < normalizedCount; i++) {
			game.animation.thread(() => {
				const card = new cardConstructor(game)
				const unit = game.board.createUnit(card, owner, rowIndex, unitIndex + 1)
				if (unit) {
					units.push(unit)
				}
			})
		}
		game.animation.syncAnimationThreads()
		return units
	},

	summonUnitFromDeck: (args: {
		card: ServerCard
		owner: ServerPlayerInGame
		rowIndex: number
		unitIndex: number
		threadType?: AnimationThreadType
	}): ServerUnit | null => {
		const { card, owner, rowIndex, unitIndex } = args
		const threadType = args.threadType || 'sync'

		const game = owner.game
		if (game.board.rows[rowIndex].isFull()) {
			return null
		}

		return game.animation.smartThread(threadType, () => {
			owner.cardDeck.removeCard(card)
			const unit = game.board.createUnit(card, owner, rowIndex, unitIndex)
			if (!unit) {
				owner.cardDeck.addUnitToTop(card)
				return null
			}
			return unit
		})
	},

	summonUnitFromGraveyard: (args: {
		card: ServerCard
		owner: ServerPlayerInGame
		rowIndex: number
		unitIndex: number
		threadType?: AnimationThreadType
	}): ServerUnit | null => {
		const { card, owner, rowIndex, unitIndex } = args
		const threadType = args.threadType || 'sync'

		const game = owner.game
		if (game.board.rows[rowIndex].isFull()) {
			return null
		}

		return game.animation.smartThread(threadType, () => {
			owner.cardGraveyard.removeCard(card)
			const unit = game.board.createUnit(card, owner, rowIndex, unitIndex)
			if (!unit) {
				owner.cardGraveyard.addUnit(card)
				return null
			}
			return unit
		})
	},

	playCardFromHand: (card: ServerCard): void => {
		const cardOwner = card.ownerPlayer
		if (!cardOwner.cardHand.allCards.includes(card)) {
			throw new Error(`Card ${card.id} is not in hand!`)
		}
		cardOwner.cardHand.removeCard(card)
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, cardOwner), 'hand')
	},

	/**
	 * @deprecated Use `playCardFromDeck` or `playCardFromGraveyard` instead.
	 */
	playCardFromDeckOrGraveyard: (card: ServerCard): void => {
		const cardOwner = card.ownerPlayer
		if (cardOwner.cardDeck.allCards.includes(card)) {
			cardOwner.cardDeck.removeCard(card)
		} else if (cardOwner.cardGraveyard.allCards.includes(card)) {
			cardOwner.cardGraveyard.removeCard(card)
		}
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, cardOwner), 'deck')
	},

	playCardFromDeck: (card: ServerCard): void => {
		const cardOwner = card.ownerPlayer
		if (!cardOwner.cardDeck.allCards.includes(card)) {
			throw new Error(`Card ${card.id} is not in the deck!`)
		}
		cardOwner.cardDeck.removeCard(card)
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, cardOwner), 'deck')
	},

	playCardFromGraveyard: (card: ServerCard, newOwner: ServerPlayerInGame): void => {
		const cardOwner = card.ownerPlayer
		if (!cardOwner.cardGraveyard.allCards.includes(card)) {
			throw new Error(`Card ${card.id} is not in the graveyard!`)
		}
		cardOwner.cardGraveyard.removeCard(card)
		card.game.cardPlay.playCardToResolutionStack(new ServerOwnedCard(card, newOwner), 'graveyard')
	},

	discardCard: (card: ServerCard): void => {
		const owner = card.ownerPlayer
		owner.cardHand.discardCard(card)
		owner.cardGraveyard.addCard(card)
	},

	returnCardFromBoardToHand: (unit: ServerUnit): void => {
		const card = unit.card
		const owner = card.ownerPlayer
		card.game.board.removeUnit(unit)
		owner.cardHand.addUnit(card)
		card.game.events.postEvent(
			GameEventCreators.cardReturned({
				game: card.game,
				owner: owner,
				location: CardLocation.HAND,
				triggeringCard: card,
			})
		)
	},

	returnCardFromHandToDeck: (card: ServerCard): void => {
		const owner = card.ownerPlayer
		owner.cardHand.discardCard(card)
		owner.cardDeck.addUnitToBottom(card)
		card.game.events.postEvent(
			GameEventCreators.cardReturned({
				game: card.game,
				owner: owner,
				location: CardLocation.DECK,
				triggeringCard: card,
			})
		)
	},

	returnCardFromBoardToDeck: (unit: ServerUnit): void => {
		const card = unit.card
		const owner = card.ownerPlayer
		card.game.board.removeUnit(unit)
		owner.cardDeck.addUnitToBottom(card)
		card.game.events.postEvent(
			GameEventCreators.cardReturned({
				game: card.game,
				owner: owner,
				location: CardLocation.DECK,
				triggeringCard: card,
			})
		)
	},

	transformCard: (card: ServerCard, targetCard: CardConstructor): ServerCard => {
		const owner = card.ownerPlayer
		const location = card.location
		const newCard = new targetCard(card.game)
		if (location === CardLocation.HAND) {
			owner.cardHand.removeCard(card)
			owner.cardHand.addUnit(newCard)
		} else {
			throw new Error(`Card transformation in ${location} is not implemented.`)
		}
		return newCard
	},

	transformUnit: (unit: ServerUnit | null | undefined, targetCard: CardConstructor): ServerUnit | null => {
		if (!unit) {
			return null
		}
		const rowIndex = unit.rowIndex
		const unitIndex = unit.unitIndex
		unit.game.board.removeUnit(unit)
		return unit.game.board.createUnit(CardLibrary.instantiate(unit.game, targetCard), unit.originalOwner, rowIndex, unitIndex)
	},

	resetUnit: (unit: ServerUnit): ServerUnit => {
		const rowIndex = unit.rowIndex
		const unitIndex = unit.unitIndex
		unit.game.board.removeUnit(unit)
		return unit.game.board.createUnit(
			CardLibrary.instantiate(unit.game, getConstructorFromCard(unit.card)),
			unit.originalOwner,
			rowIndex,
			unitIndex
		)!
	},

	destroyUnit: (args: { unit: ServerUnit; source?: ServerCard; affectedCards?: ServerCard[] }) => {
		const { unit, source, affectedCards } = args
		unit.game.board.destroyUnit(unit, {
			destroyer: source,
			affectedCards,
		})
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

	addCardToDeck: (player: ServerPlayerInGame, card: CardConstructor): ServerCard => {
		const instance = new card(player.game)
		if (instance.type === CardType.UNIT) {
			player.cardDeck.addUnitToBottom(instance)
		} else {
			player.cardDeck.addSpellToBottom(instance)
		}
		return instance
	},

	addCardToGraveyard: (player: ServerPlayerInGame, card: CardConstructor): ServerCard => {
		const instance = new card(player.game)
		player.cardGraveyard.addCard(instance)
		return instance
	},

	triggerEvent: (card: ServerCard, event: GameEvent): void => {
		card.game.events.postEvent(event, [card])
	},

	toggleLock: ({ card, source }: { card: ServerCard; source: ServerCard }): void => {
		if (card.buffs.has(BuffGwentLock)) {
			card.buffs.removeAll(BuffGwentLock, source)
		} else {
			card.buffs.add(BuffGwentLock, source)
		}
	},

	revealCard: (card: ServerCard): void => {
		card.reveal()
	},

	addCardToHand: {
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(card.game, cardClass)
				return addCardToHand(getOwnerPlayer(card), newCard, options)
			},

			fromInstance: (instance: ServerCard, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(card.game, instance)
				return addCardToHand(getOwnerPlayer(card), newCard, options)
			},

			fromConstructor: (prototype: CardConstructor, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiate(card.game, prototype)
				return addCardToHand(getOwnerPlayer(card), newCard, options)
			},
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiateFromClass(player.game, cardClass)
				return addCardToHand(player, newCard, options)
			},

			fromInstance: (instance: ServerCard, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiateFromInstance(player.game, instance)
				return addCardToHand(player, newCard, options)
			},

			fromConstructor: (prototype: CardConstructor, options: Partial<AddCardToHandOptions> = {}): ServerCard => {
				const newCard = CardLibrary.instantiate(player.game, prototype)
				return addCardToHand(player, newCard, options)
			},
		}),
	},

	createCard: {
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

		// TODO: Tianara, MAKE THIS WORK FOR SPIES PLSSSSSSSS
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
		player.addSpellMana(-manaToDrain, subscriber)
		player.game.animation.play(ServerAnimation.cardInfuse(card))
	},

	generateMana: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		if (subscriber instanceof ServerBuff && subscriber.parent instanceof ServerBoardRow) {
			throw new Error('Trying to infuse a board row')
		}
		const card = subscriber instanceof ServerBuff ? (subscriber.parent as ServerCard) : subscriber
		const player = getOwnerPlayer(subscriber)!
		const manaToGenerate = typeof value === 'function' ? value() : value
		player.addSpellMana(manaToGenerate, subscriber)
		player.game.animation.play(ServerAnimation.cardGenerateMana(card))
	},

	dispel: (count: number) => ({
		from: (targetCard: ServerCard | ServerUnit) => ({
			withSourceAs: (sourceCard: ServerCard) => {
				const card = targetCard instanceof ServerCard ? targetCard : targetCard.card
				targetCard.game.animation.play(ServerAnimation.cardAffectsCards(sourceCard, [card]))
				targetCard.buffs.dispel(sourceCard.ownerGroup, count)
			},
		}),
	}),

	consume: {
		cards: (args: { targets: ServerCard[]; consumer: ServerCard }): void => {
			const { targets, consumer } = args

			targets.forEach((card) => {
				consumer.game.animation.instantThread(() => {
					const power = card.stats.power
					const extraPower = card.buffs.getIntensity(BuffGwentExtraConsumePower)
					const location = card.location
					const owner = card.ownerPlayer
					if (location === CardLocation.HAND) {
						owner.cardHand.removeCard(card)
						owner.cardGraveyard.addUnit(card)
					} else if (location === CardLocation.DECK) {
						owner.cardDeck.removeCard(card)
						owner.cardGraveyard.addUnit(card)
					} else if (location === CardLocation.GRAVEYARD) {
						owner.cardGraveyard.removeCard(card)
					} else {
						throw new Error(`Unable to consume card in location ${location}`)
					}
					consumer.buffs.addMultiple(BuffStrength, power + extraPower, null, 'default', true)
				})
			})
			consumer.game.animation.syncAnimationThreads()
		},

		units: (args: { targets: ServerUnit[]; consumer: ServerCard }): void => {
			const { targets, consumer } = args

			consumer.game.animation.play(
				ServerAnimation.cardAffectsCards(
					consumer,
					targets.map((unit) => unit.card)
				)
			)
			targets.forEach((unit) => {
				consumer.game.animation.instantThread(() => {
					const power = unit.card.stats.power
					const extraPower = unit.card.buffs.getIntensity(BuffGwentExtraConsumePower)

					const consumeEventArgs = {
						game: consumer.game,
						triggeringCard: unit.card,
						triggeringUnit: unit,
						owner: unit.originalOwner,
						rowIndex: unit.rowIndex,
						unitIndex: unit.unitIndex,
						consumer,
					}

					Keywords.destroyUnit({ unit, affectedCards: [consumer] })
					consumer.game.events.postEvent(GameEventCreators.unitConsumed(consumeEventArgs))
					consumer.buffs.addMultiple(BuffStrength, power + extraPower, null, 'default', true)
				})
			})
			consumer.game.animation.syncAnimationThreads()
		},
	},

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

export default Keywords

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
