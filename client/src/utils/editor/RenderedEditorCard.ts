import { RichTextTooltip } from '@/Pixi/render/RichText'

export default interface RenderedEditorCard {
	key: string
	class: string
	render: HTMLCanvasElement
	tooltips: RichTextTooltip[]
}
