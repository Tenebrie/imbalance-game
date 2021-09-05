import Card from './Card'
import PlayerGroup from './PlayerGroup'

export default interface Unit {
	card: Card
	owner: PlayerGroup
	rowIndex: number
	unitIndex: number
}
