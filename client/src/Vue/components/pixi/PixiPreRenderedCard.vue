<template>
	<div class="pixi-library-card" ref="containerRef" />
</template>

<script lang="ts">
import store from '@/Vue/store'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import {computed, defineComponent, onMounted, ref, watch} from '@vue/composition-api'
import CardMessage from '@shared/models/network/CardMessage'

interface Props {
	card: CardMessage | null
}

export default defineComponent({
	props: {
		card: {
			type: Object as () => CardMessage | null,
		}
	},

	setup(props: Props) {
		const containerRef = ref<HTMLDivElement>()
		const isImageAppended = ref<boolean>(false)

		const renderedCard = computed<RenderedEditorCard | null>(() => {
			if (!props.card) {
				return null
			}
			return store.state.editor.renderedCards.find(renderedCard => renderedCard.class === props.card.class) || null
		})

		onMounted(() => {
			if (renderedCard.value) {
				appendImageNode()
			} else if (props.card) {
				store.dispatch.editor.requestRender({ card: props.card })
			}
		})

		watch(() => [renderedCard.value], () => {
			if (renderedCard.value) {
				appendImageNode()
			}
		})

		const appendImageNode = () => {
			if (isImageAppended.value) {
				return
			}

			isImageAppended.value = true
			const node = cloneCanvas(renderedCard.value.render)
			node.style.position = 'absolute'
			node.style.width = '100%'
			node.style.height = '100%'
			node.style.left = '0'
			containerRef.value.appendChild(node)
		}

		const cloneCanvas = (original: HTMLCanvasElement): HTMLCanvasElement => {
			const newCanvas = document.createElement('canvas')
			const context = newCanvas.getContext('2d')

			newCanvas.width = original.width
			newCanvas.height = original.height

			context.drawImage(original, 0, 0)

			return newCanvas
		}

		return {
			containerRef,
		}
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";
</style>
