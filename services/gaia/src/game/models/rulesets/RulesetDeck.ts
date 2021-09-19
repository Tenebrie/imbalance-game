import ServerEditorDeck from '../ServerEditorDeck'
import { RulesetDeckTemplate } from './ServerRuleset'

export class RulesetDeck {
	public fixedDeck: ServerEditorDeck | null

	constructor(fixedDeck: ServerEditorDeck | null) {
		this.fixedDeck = fixedDeck
	}
}

export class RulesetDeckBuilder {
	private fixedDeck: ServerEditorDeck | null = null

	public fixed(cards: RulesetDeckTemplate): RulesetDeckBuilder {
		this.fixedDeck = ServerEditorDeck.fromConstructors(cards)
		return this
	}

	public __build(): RulesetDeck {
		return new RulesetDeck(this.fixedDeck)
	}
}
