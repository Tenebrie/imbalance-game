import Card from './Card'
import PlayerInGame from './PlayerInGame'

export default interface Unit {
	card: Card
	owner: PlayerInGame
	rowIndex: number
	unitIndex: number
}
