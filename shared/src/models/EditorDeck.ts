import DeckLeader from '../enums/DeckLeader'
import EditorCard from './EditorCard'

export default interface EditorDeck {
	id: string
	name: string
	cards: EditorCard[]
	leader: DeckLeader
}
