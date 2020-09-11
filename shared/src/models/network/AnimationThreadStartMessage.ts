export default class AnimationThreadStartMessage {
	isStaggered: boolean

	constructor(isStaggering: boolean) {
		this.isStaggered = isStaggering
	}
}
