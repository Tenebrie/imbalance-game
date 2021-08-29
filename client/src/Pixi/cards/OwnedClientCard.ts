import Card from '@shared/models/Card'
import CardMessage from '@shared/models/network/card/CardMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default interface OwnedClientCard {
	card: Card | CardMessage | RenderedCard
	owner: ClientPlayerInGame
}
