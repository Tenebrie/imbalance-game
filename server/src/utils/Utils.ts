import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerCard from '../game/models/ServerCard'

export default {
	hashCode(targetString: string): number {
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
	},

	flat(array: any[], depth = 1): any[] {
		return array.reduce((flat, toFlatten) => {
			return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? flat(toFlatten, depth - 1) : toFlatten)
		}, [])
	},

	forEachInNumericEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			if (!isNaN(Number(value))) {
				handler(Number(value))
			}
		}
	},

	forEachInStringEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			if (isNaN(Number(value))) {
				handler(value)
			}
		}
	},

	shuffle(inputArray: any[]) {
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
	},

	sortCards(inputArray: ServerCard[]): ServerCard[] {
		return inputArray.slice().sort((a: Card, b: Card) => {
			return (
				(a.type - b.type) ||
				(a.type === CardType.UNIT && (a.color - b.color || b.power - a.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id))) ||
				(a.type === CardType.SPELL && (a.color - b.color || a.power - b.power || a.sortPriority - b.sortPriority || this.hashCode(a.class) - this.hashCode(b.class) || this.hashCode(a.id) - this.hashCode(b.id)))
			)
		})
	},
}
