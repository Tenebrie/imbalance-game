import Card from './Card'
import PlayerGroup from './PlayerGroup'

export default interface GroupOwnedCard {
	card: Card
	owner: PlayerGroup
}
