import Language from '../../enums/Language'

export type RulesetLocalizationEntry = {
	name: string
	label: string
	description: string
}

export type RulesetLocalization = Record<Language, RulesetLocalizationEntry>
export type PartialRulesetLocalization = Partial<Record<Language, Partial<RulesetLocalizationEntry>>>
export type MinimalRulesetLocalization = PartialRulesetLocalization & Record<Language.English, RulesetLocalizationEntry>
