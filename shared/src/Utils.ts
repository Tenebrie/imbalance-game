import CardType from './enums/CardType'
import Card from './models/Card'
import CardFeature from './enums/CardFeature'
import CardMessage from './models/network/card/CardMessage'
import CardColor from './enums/CardColor'
import Constants from './Constants'
import CardFaction from './enums/CardFaction'

export const cardTypeToString = (type: CardType): string => {
	switch (type) {
		case CardType.UNIT:
			return 'unit'
		case CardType.SPELL:
			return 'spell'
		default:
			throw new Error(`No string specified for type ${type}`)
	}
}

export const cardColorToString = (color: CardColor): string => {
	switch (color) {
		case CardColor.LEADER:
			return 'leader'
		case CardColor.GOLDEN:
			return 'golden'
		case CardColor.SILVER:
			return 'silver'
		case CardColor.BRONZE:
			return 'bronze'
		default:
			throw new Error(`No string specified for color ${color}`)
	}
}

export const cardFactionToString = (faction: CardFaction): string => {
	switch (faction) {
		case CardFaction.HUMAN:
			return 'human'
		case CardFaction.ARCANE:
			return 'arcane'
		case CardFaction.WILD:
			return 'wild'
		case CardFaction.NEUTRAL:
			return 'neutral'
		default:
			throw new Error(`No string specified for faction ${faction}`)
	}
}

export const hashCode = (targetString: string): number => {
	let i
	let chr
	let hash = 0
	if (targetString.length === 0) {
		return hash
	}
	for (i = 0; i < targetString.length; i++) {
		chr = targetString.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

export function sortCards<T extends Card | CardMessage>(inputArray: T[]): T[] {
	return inputArray.slice().sort((a: Card | CardMessage, b: Card | CardMessage) => {
		if ('features' in a && 'features' in b) {
			if (a.features.includes(CardFeature.TEMPORARY_CARD) && !b.features.includes(CardFeature.TEMPORARY_CARD)) {
				return 1
			} else if (!a.features.includes(CardFeature.TEMPORARY_CARD) && b.features.includes(CardFeature.TEMPORARY_CARD)) {
				return -1
			} else if (a.features.includes(CardFeature.TEMPORARY_CARD) && b.features.includes(CardFeature.TEMPORARY_CARD)) {
				return 0
			}
		}

		return (
			('features' in a &&
				'features' in b &&
				Number(a.features.includes(CardFeature.LOW_SORT_PRIORITY)) - Number(b.features.includes(CardFeature.LOW_SORT_PRIORITY))) ||
			a.type - b.type ||
			(a.type === CardType.UNIT &&
				(a.color - b.color ||
					b.stats.basePower - a.stats.basePower ||
					a.sortPriority - b.sortPriority ||
					hashCode(a.class) - hashCode(b.class) ||
					hashCode(a.id) - hashCode(b.id))) ||
			(a.type === CardType.SPELL &&
				(a.color - b.color ||
					a.stats.baseSpellCost - b.stats.baseSpellCost ||
					a.sortPriority - b.sortPriority ||
					hashCode(a.class) - hashCode(b.class) ||
					hashCode(a.id) - hashCode(b.id))) ||
			0
		)
	})
}

export const compressGameTraffic = (): boolean => {
	return process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
}

export const getRandomName = (): string => {
	const nameVowels = 'aaaeeeiiooouy'
	const nameConsonants = 'bbccddfgghhjkkllmmnpqrssttvwxz'
	let name = ''
	for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
		const sylTypeRoll = Math.random()
		const sylType =
			sylTypeRoll < 0.25
				? 'cv'
				: sylTypeRoll < 0.3
				? 'ccv'
				: sylTypeRoll < 0.5
				? 'vc'
				: sylTypeRoll < 0.75
				? 'vc'
				: sylTypeRoll < 0.9
				? 'cvc'
				: 'vcv'

		let syl = ''
		for (let i = 0; i < sylType.length; i++) {
			if (sylType[i] === 'c') {
				syl += nameConsonants[Math.floor(Math.random() * nameConsonants.length)]
			} else if (sylType[i] === 'v') {
				syl += nameVowels[Math.floor(Math.random() * nameVowels.length)]
			}
		}
		name += syl
	}
	if (nameConsonants.includes(name[name.length - 1])) {
		const endingRoll = Math.random()
		const ending =
			endingRoll < 0.08 ? 'us' : endingRoll < 0.2 ? 'a' : endingRoll < 0.3 ? 'ea' : endingRoll < 0.4 ? 'ia' : endingRoll < 0.5 ? 'as' : ''
		name += ending
	}
	return name
}

export const getMaxCardCountForColor = (color: CardColor): number => {
	switch (color) {
		case CardColor.LEADER:
			return Constants.CARD_LIMIT_LEADER
		case CardColor.GOLDEN:
			return Constants.CARD_LIMIT_GOLDEN
		case CardColor.SILVER:
			return Constants.CARD_LIMIT_SILVER
		case CardColor.BRONZE:
			return Constants.CARD_LIMIT_BRONZE
		default:
			return 0
	}
}

export const getMaxCardCopiesForColor = (color: CardColor): number => {
	switch (color) {
		case CardColor.LEADER:
			return Constants.CARD_COPIES_LIMIT_LEADER
		case CardColor.GOLDEN:
			return Constants.CARD_COPIES_LIMIT_GOLDEN
		case CardColor.SILVER:
			return Constants.CARD_COPIES_LIMIT_SILVER
		case CardColor.BRONZE:
			return Constants.CARD_COPIES_LIMIT_BRONZE
		default:
			return 0
	}
}

export const EmptyFunction = (): void => {
	/* Empty */
}

export function enumKeys<O extends Record<string, any>, K extends keyof O = keyof O>(obj: O): K[] {
	return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[]
}

export function enumToArray<O extends Record<string, any>>(enumeration: O): O[keyof O][] {
	return enumKeys(enumeration).map((key) => enumeration[key])
}

export function initializeEnumRecord<O extends Record<string, any>, K>(
	enumeration: O,
	valueGetter: (value: O[keyof O]) => K
): Record<O[keyof O], K> {
	return enumToArray(enumeration).reduce(
		(acc, val) => ({
			...acc,
			[val]: valueGetter(val),
		}),
		{} as Record<O[keyof O], K>
	)
}

export function forEachInEnum<O extends Record<string, any>>(enumeration: O, handler: (val: O[keyof O], key: keyof O) => any): void {
	for (const value of enumKeys(enumeration)) {
		handler(enumeration[value], value)
	}
}
