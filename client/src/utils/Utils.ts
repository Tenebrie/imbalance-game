export default {
	getFont(text: string) {
		let font = 'Roboto'
		let cyrillic = (/[а-яА-Я]/g).exec(text)
		if (cyrillic) {
			font = 'Roboto'
		}
		return font
	}
}
