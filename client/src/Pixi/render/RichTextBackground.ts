export default interface RichTextBackground {
	onTextRendered(position: PIXI.Point, dimensions: PIXI.Point): void
}
