import ServerCard from '../../models/game/ServerCard'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import CardOnBoardMessage from '../../shared/models/CardOnBoardMessage'
import HiddenCardMessage from '../../shared/models/network/HiddenCardMessage'

export default {
	notifyAboutCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const cardMessages = cards.map((card: ServerCard) => CardMessage.fromCard(card))
		player.sendMessage({
			type: 'update/player/hand/cardDrawn',
			data: cardMessages
		})
	},

	notifyAboutOpponentCardsDrawn(player: ServerPlayer, cards: ServerCard[]) {
		const hiddenCardMessages = cards.map((card: ServerCard) => HiddenCardMessage.fromCard(card))
		player.sendMessage({
			type: 'update/opponent/hand/cardDrawn',
			data: hiddenCardMessages
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/opponent/hand/cardRevealed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutPlayerCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/hand/cardDestroyed',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutOpponentCardDestroyed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/opponent/hand/cardDestroyed',
			data: HiddenCardMessage.fromCard(card)
		})
	}
}
