import TargetMode from '../enums/TargetMode'
import Card from './Card'
import { CardTargetCardAllowedTypes } from './CardTarget'

export interface AnonymousTargetCard {
	targetMode: TargetMode
	targetType: CardTargetCardAllowedTypes
	targetCard: Card
	targetLabel: string
}

export default AnonymousTargetCard
