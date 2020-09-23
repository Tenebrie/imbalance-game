export function cardRequire(func: () => boolean): boolean {
	try {
		return func()
	} catch (error) {
		console.error('Unexpected error in card\'s Require:', error)
		return false
	}
}

export function cardPerform(func: () => void): void {
	try {
		func()
	} catch (error) {
		console.error('Unexpected error in card\'s Perform:', error)
	}
}
