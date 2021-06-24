import { ServerRulesetTemplate } from './ServerRuleset'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'

export class RulesetChain {
	public fixedChain: RulesetConstructor | null

	constructor(fixedChain: RulesetConstructor | null) {
		this.fixedChain = fixedChain
	}

	public get(): ServerRulesetTemplate {
		return RulesetLibrary.findTemplate(this.fixedChain!)
	}
}

export class RulesetChainBuilder {
	private fixedChain: RulesetConstructor | null = null

	public fixed(ruleset: RulesetConstructor): RulesetChainBuilder {
		this.fixedChain = ruleset
		return this
	}

	public __build(): RulesetChain {
		return new RulesetChain(this.fixedChain)
	}
}
