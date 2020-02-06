import Card from './Card'
import PlayerInGame from './PlayerInGame'

export default interface OwnedCard {
	card: Card
	owner: PlayerInGame
}
