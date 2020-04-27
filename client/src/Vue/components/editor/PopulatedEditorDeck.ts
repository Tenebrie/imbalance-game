import DeckLeader from '@shared/enums/DeckLeader'
import PopulatedEditorCard from '@/Vue/components/editor/PopulatedEditorCard'

export default interface PopulatedEditorDeck {
	id: string
	name: string
	cards: PopulatedEditorCard[]
	leader: DeckLeader
}
