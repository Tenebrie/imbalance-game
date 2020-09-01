import Card from './Card'
import Unit from './Unit'
import BoardRow from './BoardRow'
import TargetType from '../enums/TargetType'
import TargetMode from '../enums/TargetMode'
import PlayerInGame from './PlayerInGame'
import OpenCardMessage from './network/card/OpenCardMessage'

export default interface CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard?: Card | OpenCardMessage
	sourceCardOwner?: PlayerInGame
	sourceUnit?: Unit
	targetCard?: Card | OpenCardMessage
	targetUnit?: Unit
	targetRow?: BoardRow
	targetLabel: string
	targetCardData?: OpenCardMessage
}
