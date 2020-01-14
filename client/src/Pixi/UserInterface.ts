import RenderedButton from '@/Pixi/models/RenderedButton'

export default class UserInterface {
	buttons: RenderedButton[]
	pressedButton: RenderedButton | null

	constructor() {
		this.buttons = []
		this.pressedButton = null
	}

	public registerButton(renderedButton: RenderedButton): void {
		this.buttons.push(renderedButton)
	}

	public unregisterButton(targetButton: RenderedButton): void {
		this.buttons = this.buttons.filter(buttons => buttons !== targetButton)
	}
}
