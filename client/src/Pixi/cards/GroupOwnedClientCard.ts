import Card from '@shared/models/Card'
import CardMessage from '@shared/models/network/card/CardMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'

export default interface GroupOwnedClientCard {
	card: Card | CardMessage | RenderedCard
	owner: ClientPlayerGroup
}
