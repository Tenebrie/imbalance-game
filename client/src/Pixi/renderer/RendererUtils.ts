import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import RenderQuality from '@shared/enums/RenderQuality'

export const CARD_WIDTH = 408
export const CARD_HEIGHT = 584
export const CARD_ASPECT_RATIO = CARD_WIDTH / CARD_HEIGHT

export const RESOLVING_CARD_ZINDEX = 10
export const ANNOUNCED_CARD_ZINDEX = 450
export const INSPECTED_CARD_ZINDEX = 1000

export const getScreenWidth = (): number => {
	return Core.renderer.pixi.view.width
}

export const getScreenHeight = (): number => {
	return Core.renderer.pixi.view.height
}

export interface CardRenderScale {
	superSamplingLevel: number
	generalGameFontRenderScale: number
	generalEditorFontRenderScale: number
	descriptionGameFontRenderScale: number
	descriptionEditorFontRenderScale: number
}

export const getRenderScale = (): CardRenderScale => {
	const selectedQuality = store.state.userPreferencesModule.renderQuality
	if (selectedQuality === RenderQuality.ULTRA) {
		return {
			superSamplingLevel: 2.0,
			generalGameFontRenderScale: 1.2,
			generalEditorFontRenderScale: 1.5,
			descriptionGameFontRenderScale: 1.2,
			descriptionEditorFontRenderScale: 1.5,
		}
	} else if (selectedQuality === RenderQuality.HIGH || selectedQuality === RenderQuality.DEFAULT) {
		return {
			superSamplingLevel: 1.0,
			generalGameFontRenderScale: 1.4,
			generalEditorFontRenderScale: 1.5,
			descriptionGameFontRenderScale: 1.5,
			descriptionEditorFontRenderScale: 1.2,
		}
	}
	return {
		superSamplingLevel: 1.0,
		generalGameFontRenderScale: 1.0,
		generalEditorFontRenderScale: 1.0,
		descriptionGameFontRenderScale: 1.0,
		descriptionEditorFontRenderScale: 1.0,
	}
}
