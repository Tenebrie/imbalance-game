import ExpansionSet from '@shared/enums/ExpansionSet'
import { enumKeys } from '@shared/Utils'
import AsciiColor from '@src/enums/AsciiColor'
import ServerCard from '@src/game/models/ServerCard'

import { colorize, colorizeId } from './Utils'

export const printLibraryBreakdown = (cards: ServerCard[]): string => {
	const categories = [...new Set(cards.map((card) => card.expansionSet))]

	const categoriesWithCards = categories.map((category) => ({
		category,
		cards: cards.filter((card) => card.expansionSet === category),
		cardCount: cards.filter((card) => card.expansionSet === category).length,
	}))

	return (
		'[\n  ' +
		categoriesWithCards
			.map(
				(category) =>
					`[${colorize(`ExpansionSet.${enumKeys(ExpansionSet)[category.category]}`, AsciiColor.MAGENTA)}]: ${colorizeId(
						category.cardCount
					)} cards`
			)
			.join('\n  ') +
		'\n]'
	)
}
