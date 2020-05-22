import Card from './Card'
import Unit from './Unit'
import BoardRow from './BoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'
import PlayerInGame from './PlayerInGame'
import CardMessage from './network/CardMessage'

export default interface CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard?: Card | CardMessage
	sourceCardOwner?: PlayerInGame
	sourceUnit?: Unit
	targetCard?: Card | CardMessage
	targetUnit?: Unit
	targetRow?: BoardRow
	targetLabel: string
	targetCardData?: CardMessage
}
