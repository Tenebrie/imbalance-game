import Core from '@/Pixi/Core'
import CardHand from '@/shared/models/CardHand'
import CardDeck from '@/shared/models/CardDeck'
import CardMessage from '@/shared/models/network/CardMessage'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardHandMessage from '@/shared/models/network/CardHandMessage'
import CardDeckMessage from '@/shared/models/network/CardDeckMessage'
import ChatEntryMessage from '@/shared/models/network/ChatEntryMessage'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'

const handlers: {[ index: string ]: any } = {
	'gameState/chat': (data: ChatEntryMessage) => {

	},

	'gameState/hand': (data: CardHandMessage) => {
		console.log('Hand loaded!')
		console.log(CardHand.fromMessage(data))
		Core.player.cardHand = RenderedCardHand.fromMessage(data)
	},

	'gameState/deck': (data: CardDeckMessage) => {
		console.log('Deck loaded!')
		console.log(CardDeck.fromMessage(data))
		Core.player.cardDeck = CardDeck.fromMessage(data)
	},

	'gameState/opponent': (data: PlayerInGameMessage) => {
		Core.registerOpponent(ClientPlayerInGame.fromMessage(data))
	},

	'gameState/board': (data: CardMessage[]) => {

	},

	'update/cardsDrawn': (data: CardMessage[]) => {
		data.forEach(cardMessage => {
			console.log('Card drawn')
			const card = Core.player.cardDeck.drawCard(cardMessage.id)
			Core.player.cardHand.addCard(card)
		})
	}
}

export default handlers
