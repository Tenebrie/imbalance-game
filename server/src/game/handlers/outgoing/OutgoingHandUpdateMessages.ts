import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import HiddenCardMessage from '../../shared/models/network/HiddenCardMessage'

export default {
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

	notifyAboutPlayerCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/self/hand/cardDestroyed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutOpponentCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/opponent/hand/cardDestroyed',
			data: HiddenCardMessage.fromCard(card)
		})
	}
}
