import Card from './Card'
import PlayerGroup from './PlayerGroup'
import PlayerInGame from './PlayerInGame'

export default interface OwnedCard {
	card: Card
	owner: PlayerInGame
}
