import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '@shared/models/network/CardMessage'
import HiddenCardMessage from '@shared/models/network/HiddenCardMessage'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardTarget from '../../models/ServerCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerGame from '../../models/ServerGame'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import TargetType from '@shared/enums/TargetType'
import Utils from '../../../utils/Utils'
import ServerBuff from '../../models/ServerBuff'
import BuffMessage from '@shared/models/network/BuffMessage'
import CardFeature from '@shared/enums/CardFeature'

export default {
	notifyAboutCardPlayDeclined(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/self/hand/playDeclined',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutDeckLeader(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/leader',
			data: new CardMessage(card)
		})

		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/leader',
			data: new CardMessage(card)
		})
	},

	notifyAboutUnitCardAdded(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/unit/cardAdded',
			data: new CardMessage(card)
		})

		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/unit/cardAdded',
			data: card.features.includes(CardFeature.HERO_POWER) ? new CardMessage(card) : new HiddenCardMessage(card)
		})
	},

	notifyAboutSpellCardAdded(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/spell/cardAdded',
			data: new CardMessage(card)
		})

		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/spell/cardAdded',
			data: card.features.includes(CardFeature.HERO_POWER) ? new CardMessage(card) : new HiddenCardMessage(card)
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/opponent/hand/cardRevealed',
			data: CardMessage.fromCardWithVariables(card, card.evaluateVariables())
		})
	},

	notifyAboutCardInHandDestroyed(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player

		owner.sendMessage({
			type: 'update/player/self/hand/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
		opponent.sendMessage({
			type: 'update/player/opponent/hand/cardDestroyed',
			data: HiddenCardMessage.fromCard(ownedCard.card)
		})
	},

	notifyAboutCardInDeckDestroyed(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player

		owner.sendMessage({
			type: 'update/player/self/deck/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
		opponent.sendMessage({
			type: 'update/player/opponent/deck/cardDestroyed',
			data: HiddenCardMessage.fromCard(ownedCard.card)
		})
	},

	notifyAboutCardResolving(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = CardMessage.fromCard(ownedCard.card)

		owner.sendMessage({
			type: 'update/stack/cardResolving',
			data: data,
			highPriority: true
		})
		opponent.sendMessage({
			type: 'update/stack/cardResolving',
			data: data
		})
	},

	notifyAboutResolvingCardTargets(player: ServerPlayer, validTargets: ServerCardTarget[]) {
		const messages = validTargets.map(target => {
			const message = new CardTargetMessage(target)
			if (target.targetType === TargetType.CARD_IN_LIBRARY || target.targetType === TargetType.CARD_IN_UNIT_DECK || target.targetType === TargetType.CARD_IN_SPELL_DECK) {
				message.attachTargetCardData(target.targetCard)
			}
			return message
		})
		const shuffledMessages = Utils.shuffle(messages)
		player.sendMessage({
			type: 'update/stack/cardTargets',
			data: shuffledMessages,
			highPriority: true
		})
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = CardMessage.fromCard(ownedCard.card)

		owner.sendMessage({
			type: 'update/stack/cardResolved',
			data: data,
			highPriority: true
		})
		opponent.sendMessage({
			type: 'update/stack/cardResolved',
			data: data
		})
	},

	notifyAboutCardBuffAdded(card: ServerCard, buff: ServerBuff) {
		if (!card.owner) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new BuffMessage(buff)

		owner.sendMessage({
			type: 'update/card/buffs/added',
			data: message
		})
		opponent.sendMessage({
			type: 'update/card/buffs/added',
			data: message
		})
	},

	notifyAboutCardBuffIntensityChanged(card: ServerCard, buff: ServerBuff) {
		if (!card.owner) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new BuffMessage(buff)

		owner.sendMessage({
			type: 'update/card/buffs/intensityChanged',
			data: message
		})
		opponent.sendMessage({
			type: 'update/card/buffs/intensityChanged',
			data: message
		})
	},

	notifyAboutCardBuffDurationChanged(card: ServerCard, buff: ServerBuff) {
		if (!card.owner) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new BuffMessage(buff)

		owner.sendMessage({
			type: 'update/card/buffs/durationChanged',
			data: message
		})
		opponent.sendMessage({
			type: 'update/card/buffs/durationChanged',
			data: message
		})
	},

	notifyAboutCardBuffRemoved(card: ServerCard, buff: ServerBuff) {
		if (!card.owner) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new BuffMessage(buff)

		owner.sendMessage({
			type: 'update/card/buffs/removed',
			data: message
		})
		opponent.sendMessage({
			type: 'update/card/buffs/removed',
			data: message
		})
	},

	notifyAboutUnitCardInDeck(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/deck/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/deck/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutSpellCardInDeck(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/deck/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/deck/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutUnitCardInGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/graveyard/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/graveyard/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutSpellCardInGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/graveyard/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/graveyard/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardInGraveyardDestroyed(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player

		owner.sendMessage({
			type: 'update/player/self/graveyard/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
		opponent.sendMessage({
			type: 'update/player/opponent/graveyard/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
	},

	notifyAboutCardVariablesUpdated(game: ServerGame) {
		game.players.forEach(playerInGame => {
			const cardsToNotify = game.board.getUnitsOwnedByPlayer(playerInGame).map(unit => unit.card).concat(playerInGame.cardHand.allCards)
			if (game.cardPlay.cardResolveStack.currentCard) {
				cardsToNotify.push(game.cardPlay.cardResolveStack.currentCard.card)
			}
			const messages = cardsToNotify.map(card => new CardVariablesMessage(card, card.evaluateVariables()))
			playerInGame.player.sendMessage({
				type: 'update/card/variables',
				data: messages
			})
		})
	}
}
