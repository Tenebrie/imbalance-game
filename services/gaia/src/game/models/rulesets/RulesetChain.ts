import RulesetFeature from '@shared/enums/RulesetFeature'
import RulesetLibrary, { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { getRandomArrayValue } from '@src/utils/Utils'

export class RulesetChain {
	public readonly conditions: ((args: RulesetChainRequireArguments) => boolean)[]
	public readonly fixedLink: RulesetConstructor | null
	public readonly linkGetter: ((game: ServerGame) => ServerRuleset | RulesetConstructor | RulesetFeature[]) | null = null
	public readonly featureLink: RulesetFeature[]

	constructor(
		conditions: ((args: RulesetChainRequireArguments) => boolean)[],
		fixedLink: RulesetConstructor | null,
		linkGetter: ((game: ServerGame) => ServerRuleset | RulesetConstructor | RulesetFeature[]) | null,
		featureLink: RulesetFeature[]
	) {
		this.conditions = conditions
		this.fixedLink = fixedLink
		this.linkGetter = linkGetter
		this.featureLink = featureLink
	}

	public isValid(args: RulesetChainRequireArguments): boolean {
		return this.conditions.every((condition) => condition(args))
	}

	public get(game: ServerGame): RulesetConstructor {
		let link

		if (this.fixedLink) {
			link = this.fixedLink
		} else if (this.linkGetter) {
			link = this.linkGetter(game)
			if (Array.isArray(link)) link = this.getByFeatures(game, link)
		} else if (this.featureLink) {
			link = this.getByFeatures(game, this.featureLink)
		}
		if (!link) {
			throw new Error('No valid link for ruleset chain.')
		}
		if (link instanceof ServerRuleset) {
			link = link.constructor as RulesetConstructor
		}
		return link
	}

	private getByFeatures(game: ServerGame, featureLink: RulesetFeature[]): RulesetConstructor {
		const validRulesets = RulesetLibrary.rulesets.filter((ruleset) => featureLink.some((link) => ruleset.features.includes(link)))
		if (validRulesets.length === 0) {
			throw new Error(`No rulesets found with featureLink ${JSON.stringify(featureLink)}`)
		}
		const filteredRulesets = validRulesets.filter((ruleset) => ruleset.isValidChainFrom(game))
		if (filteredRulesets.length === 0) {
			throw new Error(
				`No rulesets accepted feature link ${JSON.stringify(featureLink)}. Matching rulesets: ${JSON.stringify(
					validRulesets.map((ruleset) => ruleset.class)
				)}`
			)
		}
		return getRandomArrayValue(filteredRulesets).constructor as RulesetConstructor
	}
}

export class RulesetChainBuilder {
	private conditions: ((args: RulesetChainRequireArguments) => boolean)[] = []
	private fixedLink: RulesetConstructor | null = null
	private linkGetter: ((game: ServerGame) => ServerRuleset | RulesetConstructor | RulesetFeature[]) | null = null
	private featureLink: RulesetFeature[] = []

	public require(condition: (args: RulesetChainRequireArguments) => boolean): RulesetChainBuilder {
		this.conditions.push(condition)
		return this
	}

	public setFixedLink(ruleset: RulesetConstructor): void {
		this.fixedLink = ruleset
	}

	public setLinkGetter(getter: () => ServerRuleset | RulesetConstructor | RulesetFeature[]): void {
		this.linkGetter = getter
	}

	public setFeatureLink(feature: RulesetFeature | RulesetFeature[]): void {
		if (typeof feature === 'object') {
			this.featureLink = feature
		} else {
			this.featureLink = [feature]
		}
	}

	public __build(): RulesetChain {
		return new RulesetChain(this.conditions, this.fixedLink, this.linkGetter, this.featureLink)
	}
}

type RulesetChainRequireArguments = {
	game: ServerGame
	victoriousPlayer: ServerPlayerGroup | null
}
