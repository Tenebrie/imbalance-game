import CardFaction from '@shared/enums/CardFaction'
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
		cardCount: cards.filter((card) => card.expansionSet === category && card.isCollectible).length,
		tokenCount: cards.filter((card) => card.expansionSet === category && !card.isCollectible).length,
	}))

	const collectibleCategories =
		'[\n  ' +
		categoriesWithCards
			.filter((category) => category.cardCount > 0)
			.map(
				(category) =>
					`[${colorize(`ExpansionSet.${enumKeys(ExpansionSet)[category.category]}`, AsciiColor.MAGENTA)}]: ${colorizeId(
						category.cardCount
					)} collectible, ${colorizeId(category.tokenCount)} tokens`
			)
			.join('\n  ')
	const nonCollectibleCategories =
		'  ' +
		categoriesWithCards
			.filter((category) => category.cardCount === 0 && category.tokenCount > 0)
			.map(
				(category) =>
					`[${colorize(`ExpansionSet.${enumKeys(ExpansionSet)[category.category]}`, AsciiColor.MAGENTA)}]: ${colorizeId(
						category.tokenCount
					)} hidden from library`
			)
			.join('\n  ') +
		'\n]'

	return collectibleCategories + '\n' + nonCollectibleCategories
}

export const printFactionBreakdown = (cards: ServerCard[]): string => {
	const factions = [...new Set(cards.map((card) => card.faction))]

	const factionsWithCards = factions.map((faction) => ({
		faction,
		cards: cards.filter((card) => card.expansionSet === ExpansionSet.GWENT && card.faction === faction),
		cardCount: cards.filter((card) => card.expansionSet === ExpansionSet.GWENT && card.faction === faction && card.isCollectible).length,
		tokenCount: cards.filter((card) => card.expansionSet === ExpansionSet.GWENT && card.faction === faction && !card.isCollectible).length,
	}))

	const collectibleFactions =
		'[\n  ' +
		factionsWithCards
			.filter((faction) => faction.cardCount > 0)
			.map(
				(faction) =>
					`[${colorize(`CardFaction.${enumKeys(CardFaction)[faction.faction]}`, AsciiColor.MAGENTA)}]: ${colorizeId(
						faction.cardCount
					)} collectible, ${colorizeId(faction.tokenCount)} tokens`
			)
			.join('\n  ') +
		'\n]'

	return collectibleFactions
}
