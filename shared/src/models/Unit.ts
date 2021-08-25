import Card from './Card'
import PlayerInGame from './PlayerInGame'
import PlayerGroup from './PlayerGroup'

export default interface Unit {
	card: Card
	owner: PlayerGroup
	rowIndex: number
	unitIndex: number
}
