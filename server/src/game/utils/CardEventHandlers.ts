export function cardRequire(func: () => boolean) {
	try {
		return func()
	} catch (error) {
		console.error('Unexpected error in card\'s Require:', error)
	}
}

export function cardPerform(func: () => void) {
	try {
		func()
	} catch (error) {
		console.error('Unexpected error in card\'s Perform:', error)
	}
}
