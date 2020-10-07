import CardType from './enums/CardType'
import Card from './models/Card'
import CardFeature from './enums/CardFeature'
import CardMessage from './models/network/card/CardMessage'

export const hashCode = (targetString: string): number => {
	let i
	let chr
	let hash = 0
	if (targetString.length === 0) {
		return hash
	}
	for (i = 0; i < targetString.length; i++) {
		chr = targetString.charCodeAt(i)
		hash = ((hash << 5) - hash) + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

export const sortCards = (inputArray: Card[] | CardMessage[]): Card[] | CardMessage[] => {
	return inputArray.slice().sort((a: Card | CardMessage, b: Card | CardMessage) => {
		return (
			('features' in a && 'features' in b) && (Number(a.features.includes(CardFeature.LOW_SORT_PRIORITY)) - Number(b.features.includes(CardFeature.LOW_SORT_PRIORITY))) ||
			(a.type - b.type) ||
			(a.type === CardType.UNIT && (a.color - b.color || b.stats.basePower - a.stats.basePower || a.sortPriority - b.sortPriority || hashCode(a.class) - hashCode(b.class) || hashCode(a.id) - hashCode(b.id))) ||
			(a.type === CardType.SPELL && (a.color - b.color || a.stats.baseSpellCost - b.stats.baseSpellCost || a.sortPriority - b.sortPriority || hashCode(a.class) - hashCode(b.class) || hashCode(a.id) - hashCode(b.id))) ||
			0
		)
	})
}
