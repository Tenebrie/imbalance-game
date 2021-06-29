import { ServerRulesetTemplate } from './ServerRuleset'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

export class RulesetChain {
	public readonly conditions: ((args: RulesetChainRequireArguments) => boolean)[]
	public readonly fixedLink: RulesetConstructor | null
	public readonly linkGetter: ((game: ServerGame) => RulesetConstructor) | null = null

	constructor(
		conditions: ((args: RulesetChainRequireArguments) => boolean)[],
		fixedLink: RulesetConstructor | null,
		linkGetter: ((game: ServerGame) => RulesetConstructor) | null
	) {
		this.conditions = conditions
		this.fixedLink = fixedLink
		this.linkGetter = linkGetter
	}

	public isValid(args: RulesetChainRequireArguments): boolean {
		return this.conditions.every((condition) => condition(args))
	}

	public get(game: ServerGame): ServerRulesetTemplate {
		let link
		if (this.fixedLink) {
			link = this.fixedLink
		} else if (this.linkGetter) {
			link = this.linkGetter(game)
		}
		if (!link) {
			throw new Error('No valid link for ruleset chain.')
		}
		return RulesetLibrary.findTemplate(link)
	}
}

export class RulesetChainBuilder {
	private conditions: ((args: RulesetChainRequireArguments) => boolean)[] = []
	private fixedLink: RulesetConstructor | null = null
	private linkGetter: ((game: ServerGame) => RulesetConstructor) | null = null

	public require(condition: (args: RulesetChainRequireArguments) => boolean): RulesetChainBuilder {
		this.conditions.push(condition)
		return this
	}

	public setFixedLink(ruleset: RulesetConstructor): void {
		this.fixedLink = ruleset
	}

	public setLinkGetter(getter: (game: ServerGame) => RulesetConstructor): void {
		this.linkGetter = getter
	}

	public __build(): RulesetChain {
		return new RulesetChain(this.conditions, this.fixedLink, this.linkGetter)
	}
}

type RulesetChainRequireArguments = {
	game: ServerGame
	victoriousPlayer: ServerPlayerGroup | null
}
