import * as PIXI from 'pixi.js'

export default interface RichTextBackground {
	onTextRendered(position: PIXI.Point, dimensions: PIXI.Point): void
}
