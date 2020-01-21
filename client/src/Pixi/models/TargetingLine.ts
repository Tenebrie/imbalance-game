import * as PIXI from 'pixi.js'
import Core from '@/Pixi/Core'

export default class TargetingLine {
	arrowLine: PIXI.Graphics
	startingPoint: PIXI.Graphics
	targetPoint: PIXI.Graphics

	constructor() {
		this.arrowLine = new PIXI.Graphics()
		this.startingPoint = new PIXI.Graphics()
		this.targetPoint = new PIXI.Graphics()
	}

	public create() {
		Core.renderer.pixi.stage.addChild(this.arrowLine)
		Core.renderer.pixi.stage.addChild(this.startingPoint)
		Core.renderer.pixi.stage.addChild(this.targetPoint)
	}

	public destroy() {
		Core.renderer.pixi.stage.removeChild(this.arrowLine)
		Core.renderer.pixi.stage.removeChild(this.startingPoint)
		Core.renderer.pixi.stage.removeChild(this.targetPoint)
	}
}
