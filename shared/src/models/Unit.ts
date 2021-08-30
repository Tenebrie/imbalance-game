import Card from './Card'
import PlayerGroup from './PlayerGroup'
import PlayerInGame from './PlayerInGame'

export default interface Unit {
	card: Card
	owner: PlayerGroup
	rowIndex: number
	unitIndex: number
}
