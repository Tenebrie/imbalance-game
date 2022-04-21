<template>
	<div class="admin-card-art-editor">
		<workshop-card-preview
			v-if="card"
			:card="card"
			:custom-art="imageRef"
			:render-overlay="currentState !== 'save'"
			@canvasReady="onCanvasReady"
		/>
		<div class="controls">
			<div class="file-selector">
				<label for="myfile" class="button primary"><i class="fas fa-upload" /> Select a file</label>
				<input @change="onFileSelected" type="file" id="myfile" name="myfile" accept="image/png, image/jpeg, image/webp" />
			</div>
			<button class="primary" @click="onSubmitArt"><i class="fas fa-save" /> Save</button>
			<button class="primary destructive" @click="onDeleteArt"><i class="fas fa-trash" /> Delete Current Artwork</button>
		</div>
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import axios from 'axios'
import { defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue'

import Notifications from '@/utils/Notifications'
import WorkshopCardPreview from '@/Vue/components/workshop/WorkshopCardPreview.vue'
import store from '@/Vue/store'

import TheCardArtDeletePopupVue from '../../popup/TheCardArtDeletePopup.vue'

export default defineComponent({
	components: { WorkshopCardPreview },
	props: {
		card: {
			type: Object as PropType<CardMessage>,
			required: true,
		},
	},

	setup(props) {
		const imageRef = ref<HTMLImageElement | null>(null)

		onMounted(() => {
			window.addEventListener('paste', onPagePaste)
		})
		onUnmounted(() => {
			window.removeEventListener('paste', onPagePaste)
		})

		const onPagePaste = (event: Event) => {
			const typedEvent = event as ClipboardEvent
			const items = typedEvent.clipboardData?.items || []

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf('image') == -1) continue
				const blob = (items[i] as DataTransferItem).getAsFile()
				if (blob) {
					loadFromFile(blob)
					return
				}
			}
		}

		const onFileSelected = (event: any) => {
			const files = event.target.files
			loadFromFile(files[0])
		}

		const loadFromFile = (file: File) => {
			const fileReader = new FileReader()
			fileReader.onload = async () => {
				const image = new Image()
				image.onload = function () {
					imageRef.value = image
					currentState.value = 'edit'
				}
				image.src = fileReader.result as string
			}
			fileReader.readAsDataURL(file)
		}

		const currentState = ref<'wait' | 'edit' | 'save'>('wait')
		const onCanvasReady = async ({ canvas }: { canvas: HTMLCanvasElement }) => {
			if (currentState.value !== 'save') {
				return
			}

			canvas.toBlob(async (blob) => {
				let URL = `/api/dev/cards/${props.card.class}/artwork`

				let data = new FormData()
				data.append('image', blob!)

				try {
					await axios.put(URL, data, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					})
					Notifications.success('Artwork saved successfully!')
					window.location.reload()
				} catch (e) {
					Notifications.error('Unable to save artwork!')
				}
			})
			currentState.value = 'edit'
		}

		const onSubmitArt = async () => {
			if (currentState.value === 'wait') {
				Notifications.error('Nothing to save')
				return
			}
			currentState.value = 'save'
		}

		const onDeleteArt = () => {
			store.dispatch.popupModule.open({
				component: TheCardArtDeletePopupVue,
				onConfirm: async () => {
					try {
						await axios.delete(`/api/dev/cards/${props.card.class}/artwork`)
						Notifications.success('Artwork deleted successfully!')
						window.location.reload()
					} catch (e) {
						Notifications.error('Unable to delete artwork!')
					}
				},
				params: {
					cardClass: props.card.class,
				},
			})
		}

		return {
			currentState,
			imageRef,
			onFileSelected,
			onSubmitArt,
			onDeleteArt,
			onCanvasReady,
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
	flex-direction: column;

	.controls {
		flex: 1;
		display: flex;
		gap: 8px;
		width: 100%;

		& > * {
			flex: 1;
		}

		input[type='file'] {
			display: none;
		}
	}

	.canvas-container {
		flex: 3;
		height: 100%;
		width: 100%;
		border-radius: 8px;
		min-height: calc(584px * 1.2);
		background: gray;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		background-color: #292929;
		background-size: 16px 16px;
		background-position: 0 0, 8px 8px;
		background-image: linear-gradient(45deg, #333333 25%, transparent 25%, transparent 75%, #333333 75%, #333333),
			linear-gradient(45deg, #333333 25%, transparent 25%, transparent 75%, #333333 75%, #333333);
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
