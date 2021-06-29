import Card from './Card'
import PlayerInGame from './PlayerInGame'
import PlayerGroup from './PlayerGroup'

export default interface OwnedCard {
	card: Card
	owner: PlayerInGame
}
