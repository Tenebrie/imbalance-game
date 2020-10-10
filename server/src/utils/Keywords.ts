import ServerCard from '../game/models/ServerCard'
import BuffTutoredCard from '../game/buffs/BuffTutoredCard'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLibrary, {CardConstructor} from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import CardType from '@shared/enums/CardType'
import ServerBuff from '../game/models/ServerBuff'
import ServerAnimation from '../game/models/ServerAnimation'

const createCard = (player: ServerPlayerInGame, card: ServerCard): ServerCard => {
	card.buffs.add(BuffTutoredCard, null, BuffDuration.END_OF_THIS_TURN)
	if (card.type === CardType.UNIT) {
		player.cardHand.onUnitDrawn(card)
	} else if (card.type === CardType.SPELL) {
		player.cardHand.onSpellDrawn(card)
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

	createCard: {
		forOwnerOf: (card: ServerCard) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(card.game, cardClass)
				return createCard(card.ownerInGame, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(card.game, instance)
				return createCard(card.ownerInGame, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(card.game, prototype)
				return createCard(card.ownerInGame, newCard)
			},
		}),

		for: (player: ServerPlayerInGame) => ({
			fromClass: (cardClass: string): ServerCard => {
				const newCard = CardLibrary.instantiateByClass(player.game, cardClass)
				return createCard(player, newCard)
			},

			fromInstance: (instance: ServerCard): ServerCard => {
				const newCard = CardLibrary.instantiateByInstance(player.game, instance)
				return createCard(player, newCard)
			},

			fromConstructor: (prototype: CardConstructor): ServerCard => {
				const newCard = CardLibrary.instantiateByConstructor(player.game, prototype)
				return createCard(player, newCard)
			},
		})
	},

	infuse: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		const card = (subscriber instanceof ServerBuff ? subscriber.card : subscriber)
		const player = card.ownerInGame
		const manaToDrain = typeof(value) === 'function' ? value() : value
		if (player.spellMana < manaToDrain) {
			throw new Error('Player does not have enough mana!')
		}
		player.addSpellMana(-manaToDrain)
		player.game.animation.play(ServerAnimation.cardInfuse(card))
	},

	generateMana: (subscriber: ServerCard | ServerBuff, value: number | (() => number)): void => {
		const card = (subscriber instanceof ServerBuff ? subscriber.card : subscriber)
		const player = card.ownerInGame
		const manaToGenerate = typeof(value) === 'function' ? value() : value
		player.addSpellMana(manaToGenerate)
		player.game.animation.play(ServerAnimation.cardGenerateMana(card))
	}
}