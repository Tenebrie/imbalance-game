import Language from '../../enums/Language'

export type CardLocalizationEntry = {
	name: string
	title: string
	flavor: string
	listName: string
	description: string
}

export type CardLocalization = Record<Language, Partial<CardLocalizationEntry>>
export type PartialCardLocalization = Partial<Record<Language, Partial<CardLocalizationEntry>>>
