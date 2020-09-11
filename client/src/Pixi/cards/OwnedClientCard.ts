import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardMessage from '@shared/models/network/card/CardMessage'
import Card from '@shared/models/Card'

export default interface OwnedClientCard {
	card: Card | CardMessage | RenderedCard
	owner: ClientPlayerInGame
}
