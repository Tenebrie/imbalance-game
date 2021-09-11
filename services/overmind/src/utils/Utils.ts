import { v4 as getRandomId } from 'uuid'

import AsciiColor from '../enums/AsciiColor'

export const createRandomGuid = (): string => {
	return getRandomId()
}

export const colorize = (text: string | number, color: AsciiColor): string => {
	return `${color}${text}\u001b[0m`
}

export const colorizeId = (text: string | number): string => {
	return colorize(text, AsciiColor.CYAN)
}

export const colorizeClass = (text: string | number): string => {
	return colorize(text, AsciiColor.YELLOW)
}

export const colorizePlayer = (text: string | number): string => {
	return colorize(text, AsciiColor.RED)
}

export const colorizeConsoleText = (text: string | number): string => {
	return colorize(text, AsciiColor.MAGENTA)
}

export const limitValueToInterval = (min: number, value: number, max: number): number => {
	return Math.max(min, Math.min(value, max))
}

export const snakeToCamelCase = (str: string): string =>
	str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

export function shuffle<T>(inputArray: T[]): T[] {
	const array = inputArray.slice()
	let currentIndex = array.length

	while (currentIndex > 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		const temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

export const getRandomArrayValue = <T>(array: T[]): T => {
	return array[Math.floor(Math.random() * array.length)]
}
