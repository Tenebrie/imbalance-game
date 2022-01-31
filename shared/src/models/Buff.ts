import BuffAlignment from '../enums/BuffAlignment'
import BuffFeature from '../enums/BuffFeature'
import CardFeature from '../enums/CardFeature'
import CardTribe from '../enums/CardTribe'
import BoardRow from './BoardRow'
import Card from './Card'
import { BuffLocalization } from './cardLocalization/CardLocalization'

export type BuffSource = Card | BoardRow | null

export default interface Buff {
	id: string
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	localization: BuffLocalization

	duration: number
	baseDuration: number

	protected: boolean
}

export interface CardBuff extends Buff {
	parent: Card | null
}

export interface RowBuff extends Buff {
	parent: BoardRow | null
}
