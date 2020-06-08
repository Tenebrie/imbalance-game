import CardDeckMessage from './network/CardDeckMessage'
import EditorDeck from './EditorDeck'
import PopulatedEditorCard from './PopulatedEditorCard'

export default interface PopulatedEditorDeck extends EditorDeck {
	cards: PopulatedEditorCard[]
}
