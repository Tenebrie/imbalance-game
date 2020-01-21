import RenderedButton from '@/Pixi/models/RenderedButton'
import * as PIXI from 'pixi.js'
import Settings from '@/Pixi/Settings'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import Core from '@/Pixi/Core'

export default class UserInterface {
	buttons: RenderedButton[]
	pressedButton: RenderedButton | null

	endTurnButton: RenderedButton

	constructor() {
		this.buttons = []
		this.pressedButton = null

		this.endTurnButton = new RenderedButton('End turn', new PIXI.Point(Core.renderer.pixi.view.width - 100 * Settings.superSamplingLevel, Core.renderer.pixi.view.height / 2), () => {
			OutgoingMessageHandlers.sendEndTurn()
		})
		this.registerButton(this.endTurnButton)
	}

	public registerButton(renderedButton: RenderedButton): void {
		this.buttons.push(renderedButton)
		Core.renderer.registerButton(renderedButton)
	}

	public unregisterButton(targetButton: RenderedButton): void {
		this.buttons = this.buttons.filter(buttons => buttons !== targetButton)
		Core.renderer.unregisterButton(targetButton)
	}
}
