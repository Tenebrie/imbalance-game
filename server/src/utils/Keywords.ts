import ServerCard from '../game/models/ServerCard'
import BuffTutoredCard from '../game/buffs/BuffTutoredCard'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import CardType from '@shared/enums/CardType'
import ServerBuff from '../game/models/ServerBuff'
import ServerAnimation from '../game/models/ServerAnimation'
import BuffUnitToSpellConversion from '../game/buffs/BuffUnitToSpellConversion'

const createCard = (player: ServerPlayerInGame, card: ServerCard): ServerCard => {
	card.buffs.add(BuffTutoredCard, null, BuffDuration.END_OF_THIS_TURN)
	if (card.type === CardType.UNIT) {
		player.cardHand.onUnitDrawn(card)
	} else if (card.type === CardType.SPELL) {
		player.cardHand.onSpellDrawn(card)
	}
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
	summonCard: (card: ServerCard): void => {
		const cardOwner = card.ownerInGame
		card.buffs.add(BuffTutoredCard, null, BuffDuration.END_OF_THIS_TURN)
		cardOwner.cardDeck.removeCard(card)
		cardOwner.cardHand.onUnitDrawn(card)
	},

	discardCard: (card: ServerCard): void => {
		card.ownerInGame.cardHand.discardCard(card)
	},

	addCard: {
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
				return addCardToHand(card.ownerInGame, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(instance)
				return addCardToHand(card.ownerInGame, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
				return addCardToHand(card.ownerInGame, newCard)
			},
		}),

		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
				return addCardToHand(player, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(instance)
				return addCardToHand(player, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
				return addCardToHand(player, newCard)
			},
		}),
	},

	createCard: {
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
				return createCard(card.ownerInGame, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(instance)
				return createCard(card.ownerInGame, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
				return createCard(card.ownerInGame, newCard)
			},
		}),

		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
				return createCard(player, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(instance)
				return createCard(player, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
				return createCard(player, newCard)
			},
		}),
	},

	infuse: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		const card = subscriber instanceof ServerBuff ? subscriber.card : subscriber
		const player = card.ownerInGame
		const manaToDrain = typeof value === 'function' ? value() : value
		if (player.spellMana < manaToDrain) {
			throw new Error('Player does not have enough mana!')
		}
		player.addSpellMana(-manaToDrain)
		player.game.animation.play(ServerAnimation.cardInfuse(card))
	},

	generateMana: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		const card = subscriber instanceof ServerBuff ? subscriber.card : subscriber
		const player = card.ownerInGame
		const manaToGenerate = typeof value === 'function' ? value() : value
		player.addSpellMana(manaToGenerate)
		player.game.animation.play(ServerAnimation.cardGenerateMana(card))
	},
}
