<template>
	<div class="admin-card-art-editor">
		<div class="controls">
			<div class="file-selector">
				<label for="myfile" class="button primary"><i class="fas fa-upload" /> Select a file</label>
				<input @change="onFileSelected" type="file" id="myfile" name="myfile" accept="image/png, image/jpeg, image/webp" />
			</div>
			<button class="primary" @click="onSubmitArt"><i class="fas fa-save" /> Save</button>
			<button class="primary destructive" @click="onDeleteArt"><i class="fas fa-trash" /> Delete Current Artwork</button>
		</div>
		<div
			class="canvas-container"
			@mousedown="onDragStart"
			@mousemove="onDragMove"
			@mouseup="onDragEnd"
			@mouseleave="onDragEnd"
			:onwheel="onCanvasScroll"
		>
			<canvas width="408" height="584" ref="canvasRef" class="preview-canvas" />
		</div>
	</div>
</template>

<script lang="ts">
import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'
import TheCardArtDeletePopupVue from '../../popup/TheCardArtDeletePopup.vue'

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

			console.log(files[0])
			imageScaleRef.value = 1
			imageOffsetRef.value = { x: 0, y: 0 }

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
				currentImageOffset.x -= (dragStartPoint.value.x - dragMousePoint.value.x) / imageScale
				currentImageOffset.y -= (dragStartPoint.value.y - dragMousePoint.value.y) / imageScale
			}

			ctx.globalCompositeOperation = 'source-atop'
			ctx.scale(imageScale, imageScale)
			ctx.translate(currentImageOffset.x, currentImageOffset.y)
			ctx.drawImage(image, 0, 0)
		}

		const onCanvasScroll = (event: WheelEvent) => {
			const delta = event.deltaY
			event.preventDefault()
			if ((delta > 0 && imageScaleRef.value < 0.05) || (delta < 0 && imageScaleRef.value > 2)) {
				return
			}
			imageScaleRef.value -= delta / 2500
			console.log(imageScaleRef.value)
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

			const imageScale = imageScaleRef.value
			imageOffsetRef.value.x -= (dragStartPoint.value.x - dragMousePoint.value.x) / imageScale
			imageOffsetRef.value.y -= (dragStartPoint.value.y - dragMousePoint.value.y) / imageScale
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

				try {
					await axios.put(URL, data, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					})
					Notifications.success('Artwork saved successfully!')
				} catch (e) {
					Notifications.error('Unable to save artwork!')
				}
			})
		}

		const onDeleteArt = () => {
			store.dispatch.popupModule.open({
				component: TheCardArtDeletePopupVue,
				onConfirm: async () => {
					try {
						await axios.delete(`/api/dev/cards/${props.cardClass}/artwork`)
						Notifications.success('Artwork deleted successfully!')
					} catch (e) {
						Notifications.error('Unable to delete artwork!')
					}
				},
				params: {
					cardClass: props.cardClass,
				},
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
			onDeleteArt,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';

.admin-card-art-editor {
	width: calc(100% - 32px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;

	.controls {
		flex: 1;
		margin-right: 16px;

		input[type='file'] {
			display: none;
		}
	}

	.canvas-container {
		flex: 3;
		height: 100%;
		min-height: calc(584px * 2);
		background: gray;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		background-color: #fff;
		background-size: 16px 16px;
		background-position: 0 0, 8px 8px;
		background-image: linear-gradient(45deg, #d7d7d7 25%, transparent 25%, transparent 75%, #d7d7d7 75%, #d7d7d7),
			linear-gradient(45deg, #d7d7d7 25%, transparent 25%, transparent 75%, #d7d7d7 75%, #d7d7d7);
	}

	.canvas-container:active {
		cursor: grabbing;
	}
}

.file-selector {
	display: flex;
	flex-direction: column;
}

.preview-canvas {
	border-radius: 8px;
}
</style>
