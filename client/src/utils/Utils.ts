export default {
	getFont(text: string) {
		let font = 'Roboto' // K2D
		let cyrillic = (/[а-яА-Я]/g).exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return font
	}
}
