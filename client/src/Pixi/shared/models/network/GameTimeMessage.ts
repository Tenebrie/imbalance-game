export default class GameTimeMessage {
	currentTime: number
	maximumTime: number

	constructor(currentTime: number, maximumTime: number) {
		this.currentTime = currentTime
		this.maximumTime = maximumTime
	}
}
