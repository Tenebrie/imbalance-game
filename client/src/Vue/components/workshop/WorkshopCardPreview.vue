<template>
	<div
		class="canvas-container"
		@mousedown="onDragStart"
		@mousemove="onDragMove"
		@mouseup="onDragEnd"
		@mouseleave="onDragEnd"
		:onwheel="onCanvasScroll"
	>
		<canvas id="workshop-card-canvas" width="408" height="584" ref="canvasRef" class="preview-canvas" />
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { throttle } from 'throttle-debounce'
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'

import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { editorCardRenderer, WorkshopCardProps } from '@/utils/editor/EditorCardRenderer'

type Point = { x: number; y: number }

export default defineComponent({
	props: {
		card: {
			type: Object as PropType<CardMessage & WorkshopCardProps>,
			required: true,
		},
		customArt: {
			type: Object as PropType<HTMLImageElement | null>,
		},
		renderOverlay: {
			type: Boolean as PropType<boolean | undefined>,
		},
	},

	emits: {
		canvasReady: ({ canvas }: { canvas: HTMLCanvasElement }) => {
			return canvas instanceof HTMLCanvasElement
		},
	},

	setup(props, { emit }) {
		const imageRef = ref<HTMLImageElement | null>(null)
		const canvasRef = ref<HTMLCanvasElement | null>(null)
		const baseImageRef = ref<HTMLImageElement | null>(null)

		const overlayImageRef = ref<HTMLCanvasElement | null>(null)

		const dragStartPoint = ref<Point | null>(null)
		const dragMousePoint = ref<Point | null>(null)

		const imageScaleRef = ref<number>(1)
		const imageOffsetRef = ref<Point>({ x: 0, y: 0 })

		onMounted(() => {
			const image = new Image()
			image.onload = function () {
				renderFinalCanvas()
			}
			image.src = '/assets/masks/card-bg.png'

			if (props.customArt) {
				loadCustomArtFromProps()
			}

			baseImageRef.value = image
		})

		watch(
			() => [props.customArt],
			() => {
				imageScaleRef.value = 1
				imageOffsetRef.value = { x: 0, y: 0 }
				loadCustomArtFromProps()
			}
		)

		watch(
			() => [props.renderOverlay],
			() => {
				renderFinalCanvas()
			}
		)

		const loadCustomArtFromProps = () => {
			imageRef.value = props.customArt || null

			const value = imageRef.value
			if (value) {
				imageScaleRef.value = 584 / value.height
				imageOffsetRef.value = { x: -300, y: -410 }
				value.onload = () => {
					imageScaleRef.value = 584 / value.height
					renderFinalCanvas()
				}
				renderOverlayCanvas()
				renderFinalCanvas()
			}
		}

		const renderFinalCanvas = () => {
			const image = imageRef.value
			const canvas = canvasRef.value
			const baseImage = baseImageRef.value
			if (!canvas || !baseImage) {
				return
			}

			const ctx = canvas.getContext('2d')!
			ctx.resetTransform()
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			ctx.globalCompositeOperation = 'source-over'
			ctx.drawImage(baseImage, 0, 0)

			const imageScale = imageScaleRef.value
			let currentImageOffset = {
				...imageOffsetRef.value,
			}
			if (dragStartPoint.value && dragMousePoint.value) {
				currentImageOffset.x -= (dragStartPoint.value.x - dragMousePoint.value.x) / imageScale
				currentImageOffset.y -= (dragStartPoint.value.y - dragMousePoint.value.y) / imageScale
			}

			ctx.globalCompositeOperation = 'source-atop'
			ctx.translate(canvas.width / 2, canvas.height / 2)
			ctx.scale(imageScale, imageScale)
			ctx.translate(-canvas.width / 2, -canvas.height / 2)
			ctx.translate(currentImageOffset.x, currentImageOffset.y)
			if (image) {
				ctx.drawImage(image, 0, 0)
			}

			ctx.resetTransform()

			if (props.renderOverlay || props.renderOverlay === undefined) {
				const overlayImage = overlayImageRef.value
				if (overlayImage) {
					ctx.drawImage(overlayImage, 0, 0)
				}
			}
			emit('canvasReady', {
				canvas: canvas,
			})
		}

		const onCanvasScroll = (event: WheelEvent) => {
			const delta = event.deltaY
			event.preventDefault()
			if ((delta > 0 && imageScaleRef.value < 0.05) || (delta < 0 && imageScaleRef.value > 2)) {
				return
			}
			const divider = event.shiftKey ? 20000 : 2500
			imageScaleRef.value -= delta / divider
			renderFinalCanvas()
		}

		const onDragStart = (event: MouseEvent) => {
			dragStartPoint.value = {
				x: event.clientX,
				y: event.clientY,
			}
			dragMousePoint.value = {
				x: event.clientX,
				y: event.clientY,
			}
			renderFinalCanvas()
		}

		const onDragMove = (event: MouseEvent) => {
			dragMousePoint.value = {
				x: event.clientX,
				y: event.clientY,
			}
			renderFinalCanvas()
		}

		const onDragEnd = () => {
			if (!dragStartPoint.value || !dragMousePoint.value) {
				return
			}

			const imageScale = imageScaleRef.value
			imageOffsetRef.value.x -= (dragStartPoint.value.x - dragMousePoint.value.x) / imageScale
			imageOffsetRef.value.y -= (dragStartPoint.value.y - dragMousePoint.value.y) / imageScale
			dragStartPoint.value = null
			dragMousePoint.value = null
			renderFinalCanvas()
		}

		onMounted(async () => {
			await TextureAtlas.loadCard(props.card, () => {
				renderOverlayCanvasThrottled()
			})
		})

		watch(
			() => [props.card],
			() => {
				renderOverlayCanvasThrottled()
			}
		)

		const renderOverlayCanvas = () => {
			overlayImageRef.value = editorCardRenderer.doRender(props.card, !!props.customArt).canvas
			renderFinalCanvas()
		}
		const renderOverlayCanvasThrottled = throttle(50, renderOverlayCanvas)

		return {
			onCanvasScroll,
			onDragStart,
			onDragMove,
			onDragEnd,
			canvasRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.canvas-container {
	display: flex;
	height: 100%;
	align-items: center;
	justify-content: center;
	cursor: grab;
}

.canvas-container:active {
	cursor: grabbing;
}
</style>
