import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/card/CardMessage'
import Card from '@shared/models/Card'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'

export default interface GroupOwnedClientCard {
	card: Card | CardMessage | RenderedCard
	owner: ClientPlayerGroup
}
