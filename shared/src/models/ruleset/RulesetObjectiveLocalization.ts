import Language from '../../enums/Language'

export type RulesetObjectiveLocalizationEntry = {
	title: string
	description: string
	modifiers?: (string | [string, string])[]
}

export type RulesetObjective = {
	[Language.English]: RulesetObjectiveLocalizationEntry
	[Language.Russian]?: RulesetObjectiveLocalizationEntry
}
