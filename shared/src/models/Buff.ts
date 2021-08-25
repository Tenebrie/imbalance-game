import Card from './Card'
import CardTribe from '../enums/CardTribe'
import CardFeature from '../enums/CardFeature'
import BuffFeature from '../enums/BuffFeature'
import BuffAlignment from '../enums/BuffAlignment'
import BoardRow from './BoardRow'

export type BuffSource = Card | BoardRow | null

export default interface Buff {
	id: string
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

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
