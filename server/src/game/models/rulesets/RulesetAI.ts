import AIBehaviour from '@shared/enums/AIBehaviour'

import ServerEditorDeck from '../ServerEditorDeck'
import { RulesetDeckTemplate } from './ServerRuleset'

export class RulesetAI {
	public readonly deck: ServerEditorDeck
	public readonly behaviour: AIBehaviour

	constructor(deck: ServerEditorDeck, behaviour: AIBehaviour) {
		this.deck = deck
		this.behaviour = behaviour
	}
}

export class RulesetAIBuilder {
	private deck: ServerEditorDeck
	private behaviour: AIBehaviour

	constructor(cards: RulesetDeckTemplate) {
		this.deck = ServerEditorDeck.fromConstructors(cards)
		this.behaviour = AIBehaviour.DEFAULT
	}

	public behave(behaviour: AIBehaviour): RulesetAIBuilder {
		this.behaviour = behaviour
		return this
	}

	public __build(): RulesetAI {
		return new RulesetAI(this.deck, this.behaviour)
	}
}
