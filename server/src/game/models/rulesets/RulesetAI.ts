import ServerEditorDeck from '../ServerEditorDeck'
import { RulesetDeckTemplate } from './ServerRuleset'

export class RulesetAI {
	public readonly deck: ServerEditorDeck

	constructor(deck: ServerEditorDeck) {
		this.deck = deck
	}
}

export class RulesetAIBuilder {
	private deck: ServerEditorDeck

	constructor(cards: RulesetDeckTemplate) {
		this.deck = ServerEditorDeck.fromConstructors(cards)
	}

	public __build(): RulesetAI {
		return new RulesetAI(this.deck)
	}
}
