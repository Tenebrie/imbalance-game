<template>
	<div class="admin-card-art-editor">
		<div class="file-selector">
			<label for="myfile">Select a file:</label>
			<input @change="onFileSelected" type="file" id="myfile" name="myfile" accept="image/png, image/jpeg, image/webp" />
		</div>
		<canvas
			@mousedown="onDragStart"
			@mousemove="onDragMove"
			@mouseup="onDragEnd"
			@mouseleave="onDragEnd"
			:onwheel="onCanvasScroll"
			width="408"
			height="584"
			ref="canvasRef"
			class="preview-canvas"
		/>
		<button @click="onSubmitArt">Submit</button>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'

type Point = { x: number; y: number }

export default defineComponent({
	props: {
		cardClass: {
			type: String,
			required: true,
		},
	},

	setup(props) {
		const imageRef = ref<HTMLImageElement | null>(null)
		const canvasRef = ref<HTMLCanvasElement | null>(null)
		const baseImageRef = ref<HTMLImageElement | null>(null)

		const dragStartPoint = ref<Point | null>(null)
		const dragMousePoint = ref<Point | null>(null)

		const imageScaleRef = ref<number>(1)
		const imageOffsetRef = ref<Point>({ x: 0, y: 0 })

		onMounted(() => {
			const image = new Image()
			image.onload = function () {
				renderFrame()
			}
			image.src = '/assets/masks/card-bg.png'

			baseImageRef.value = image
		})

		const onFileSelected = (event: any) => {
			const files = event.target.files

			var fr = new FileReader()
			fr.onload = async () => {
				const image = new Image()
				imageRef.value = image
				image.onload = function () {
					renderFrame()
				}
				image.src = fr.result as string
			}
			fr.readAsDataURL(files[0])

			canvasRef.value
		}

		const renderFrame = () => {
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

			if (!image) {
				return
			}

			const imageScale = imageScaleRef.value
			let currentImageOffset = {
				...imageOffsetRef.value,
			}
			if (dragStartPoint.value && dragMousePoint.value) {
				currentImageOffset.x -= dragStartPoint.value.x - dragMousePoint.value.x
				currentImageOffset.y -= dragStartPoint.value.y - dragMousePoint.value.y
			}

			ctx.globalCompositeOperation = 'source-atop'
			ctx.scale(imageScale, imageScale)
			ctx.translate(currentImageOffset.x, currentImageOffset.y)
			ctx.drawImage(image, 0, 0)
		}

		const onCanvasScroll = (event: WheelEvent) => {
			const delta = event.deltaY
			imageScaleRef.value -= delta / 2000
			event.preventDefault()
			renderFrame()
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
			renderFrame()
		}

		const onDragMove = (event: MouseEvent) => {
			dragMousePoint.value = {
				x: event.clientX,
				y: event.clientY,
			}
			renderFrame()
		}

		const onDragEnd = () => {
			if (!dragStartPoint.value || !dragMousePoint.value) {
				return
			}

			imageOffsetRef.value.x -= dragStartPoint.value.x - dragMousePoint.value.x
			imageOffsetRef.value.y -= dragStartPoint.value.y - dragMousePoint.value.y
			dragStartPoint.value = null
			dragMousePoint.value = null
			renderFrame()
		}

		const onSubmitArt = async () => {
			const canvas = canvasRef.value
			if (!canvas) {
				return
			}

			canvas.toBlob(async (blob) => {
				let URL = `/api/dev/cards/${props.cardClass}/artwork`

				let data = new FormData()
				data.append('image', blob!)

				await axios.put(URL, data, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				})
			})
		}

		return {
			canvasRef,
			onFileSelected,
			onCanvasScroll,
			onDragStart,
			onDragMove,
			onDragEnd,
			onSubmitArt,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';

.admin-card-art-editor {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 25%;
}

.file-selector {
	display: flex;
	flex-direction: column;
}

.preview-canvas {
	border-radius: 8px;
}
</style>
