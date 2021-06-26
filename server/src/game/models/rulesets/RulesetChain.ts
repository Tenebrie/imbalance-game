import { ServerRulesetTemplate } from './ServerRuleset'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

export class RulesetChain {
	public conditions: ((args: RulesetChainRequireArguments) => boolean)[]
	public fixedLink: RulesetConstructor | null

	constructor(conditions: ((args: RulesetChainRequireArguments) => boolean)[], fixedLink: RulesetConstructor | null) {
		this.conditions = conditions
		this.fixedLink = fixedLink
	}

	public isValid(args: RulesetChainRequireArguments): boolean {
		return this.conditions.every((condition) => condition(args))
	}

	public get(): ServerRulesetTemplate {
		return RulesetLibrary.findTemplate(this.fixedLink!)
	}
}

export class RulesetChainBuilder {
	private conditions: ((args: RulesetChainRequireArguments) => boolean)[] = []
	private fixedLink: RulesetConstructor | null = null

	public require(condition: (args: RulesetChainRequireArguments) => boolean): RulesetChainBuilder {
		this.conditions.push(condition)
		return this
	}

	public setFixedLink(ruleset: RulesetConstructor): void {
		this.fixedLink = ruleset
	}

	public __build(): RulesetChain {
		return new RulesetChain(this.conditions, this.fixedLink)
	}
}

type RulesetChainRequireArguments = {
	game: ServerGame
	victoriousPlayer: ServerPlayerInGame | null
}
