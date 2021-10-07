export default class GameErrorMessage {
	name: string
	message: string
	stack: string | null

	constructor(error: Error) {
		this.name = error.name
		this.message = error.message
		this.stack = error.stack || null
	}

	public toString(): string {
		return `${this.name}: ${this.message}\n${this.stack}`
	}
}
