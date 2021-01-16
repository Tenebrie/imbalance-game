<template>
	<div class="workshop-card-preview" ref="previewContainerRef"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from '@vue/composition-api'
import CardMessage from '@shared/models/network/card/CardMessage'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { WorkshopCardProps } from '@/Vue/components/workshop/WorkshopView.vue'
import { throttle } from 'throttle-debounce'

interface Props {
	card: CardMessage & WorkshopCardProps
}

export default defineComponent({
	props: {
		card: {
			type: Object as PropType<CardMessage & WorkshopCardProps>,
			required: true,
		},
	},

	setup(props: Props) {
		onMounted(async () => {
			await TextureAtlas.loadCard(props.card, () => {
				renderCard()
			})
		})

		watch(
			() => [props.card],
			() => {
				renderCard()
			}
		)

		const previewContainerRef = ref<HTMLDivElement>()
		const renderCard = throttle(50, () => {
			const container = previewContainerRef.value
			while (container.children.length > 0) {
				container.removeChild(container.children[0])
			}

			const image = editorCardRenderer.doRender(props.card)
			image.id = 'workshop-image-preview'
			container.appendChild(image)
		})

		return {
			previewContainerRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.workshop-card-preview {
	display: flex;
	height: 100%;
	align-items: center;
	justify-content: center;
}
</style>
