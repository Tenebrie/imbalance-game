import { shuffle } from '@src/utils/Utils'

export function shuffleHandCards(cards: [string, [number, number, number, number]][]): [string[], [number, number, number, number][]] {
	const paddings = 50 - cards.length
	let newCards = [...cards]

	for (let i = 0; i < paddings; i++) {
		newCards.push(['dummy' + i, [0, 0, 0, 0]])
	}

	newCards = shuffle(newCards)

	const backMap = newCards.map(([newCardId]) => cards.find(([cardId]) => newCardId === cardId)?.[0] ?? '')

	return [backMap, newCards.map((newCard) => newCard[1])]
}
