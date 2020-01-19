export default function(func: Function) {
	try {
		func()
	} catch (error) {
		console.error('Unexpected error in card event handler', error)
	}
}
