import NovelCue from './NovelCue'

export default class NovelCueMessage {
	id: string
	text: string

	constructor(value: NovelCue) {
		this.id = value.id
		this.text = value.text
	}
}
