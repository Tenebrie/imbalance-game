import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import HiddenCardMessage from '../../shared/models/network/HiddenCardMessage'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardTarget from '../../models/ServerCardTarget'
import CardTargetMessage from '../../shared/models/network/CardTargetMessage'

export default {
	notifyAboutCardPlayDeclined(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/self/hand/playDeclined',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const cardMessages = cards.map((card: ServerCard) => CardMessage.fromCard(card))
		player.sendMessage({
			type: 'update/player/self/hand/cardDrawn',
			data: cardMessages
		})
	},

	notifyAboutOpponentCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const hiddenCardMessages = cards.map((card: ServerCard) => HiddenCardMessage.fromCard(card))
		player.sendMessage({
			type: 'update/player/opponent/hand/cardDrawn',
			data: hiddenCardMessages
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/opponent/hand/cardRevealed',
			data: CardMessage.fromCard(card)
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
		const messages = validTargets.map(target => new CardTargetMessage(target))
		player.sendMessage({
			type: 'update/stack/cardTargets',
			data: messages,
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

	notifyAboutPlayerCardInGraveyard(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/self/graveyard/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutOpponentCardInGraveyard(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/opponent/graveyard/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},
}
