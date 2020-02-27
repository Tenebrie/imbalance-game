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

	flat(array: any[], depth: number = 1): any[] {
		return array.reduce((flat, toFlatten) => {
			return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? flat(toFlatten, depth - 1) : toFlatten)
		}, [])
	}
}
