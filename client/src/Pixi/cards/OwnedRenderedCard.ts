import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default interface OwnedRenderedCard {
	card: RenderedCard
	owner: ClientPlayerInGame
}
