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
		<workshop-card-preview
			v-if="card"
			:card="card"
			:custom-art="imageRef"
			:render-overlay="currentState === 'edit'"
			@canvasReady="onCanvasReady"
		/>
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import axios from 'axios'
import { defineComponent, PropType, ref } from 'vue'

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

		const onFileSelected = (event: any) => {
			const files = event.target.files

			const fileReader = new FileReader()
			fileReader.onload = async () => {
				const image = new Image()
				image.onload = function () {
					imageRef.value = image
				}
				image.src = fileReader.result as string
			}
			fileReader.readAsDataURL(files[0])
		}

		const currentState = ref<'edit' | 'save'>('edit')
		const onCanvasReady = async ({ canvas }: { canvas: HTMLCanvasElement }) => {
			if (currentState.value === 'edit') {
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
