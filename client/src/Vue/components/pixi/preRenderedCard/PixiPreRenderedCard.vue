<template>
	<div class="pixi-library-card" ref="containerRef" />
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import { getCardMessageKey } from '@/utils/Utils'
import store from '@/Vue/store'

export default defineComponent({
	props: {
		card: {
			type: Object as () => CardMessage | null,
		},
	},

	setup(props) {
		const containerRef = ref<HTMLDivElement>()
		const isImageAppended = ref<boolean>(false)

		const renderedCard = computed<RenderedEditorCard | null>(() => {
			const card = props.card
			if (!card) {
				return null
			}
			const cardKey = getCardMessageKey(card)
			return store.state.editor.renderedCards.find((renderedCard) => renderedCard.key === cardKey) || null
		})

		const isVisibleOnScreen = ref<boolean>(false)

		onMounted(() => {
			if (renderedCard.value) {
				appendImageNode()
			} else {
				const o = new IntersectionObserver(([entry]) => {
					if (entry.intersectionRatio === 1) {
						isVisibleOnScreen.value = entry.intersectionRatio === 1
						o.disconnect()
					}
				})
				o.observe(containerRef.value!)
			}
		})

		watch(
			() => [isVisibleOnScreen.value],
			() => {
				if (props.card && !renderedCard.value && isVisibleOnScreen.value) {
					store.dispatch.editor.requestRender({ card: props.card })
				}
			}
		)

		watch(
			() => [renderedCard.value, isVisibleOnScreen.value],
			() => {
				if (!isImageAppended.value && renderedCard.value && isVisibleOnScreen.value) {
					appendImageNode()
				}
			}
		)

		const appendImageNode = (): void => {
			isImageAppended.value = true
			const node = cloneCanvas(renderedCard.value!.render)
			node.style.position = 'absolute'
			node.style.width = '100%'
			node.style.height = '100%'
			node.style.left = '0'
			containerRef.value!.appendChild(node)
		}

		const cloneCanvas = (original: HTMLCanvasElement): HTMLCanvasElement => {
			const newCanvas = document.createElement('canvas')
			const context = newCanvas.getContext('2d')!

			newCanvas.width = original.width
			newCanvas.height = original.height

			context.drawImage(original, 0, 0)

			return newCanvas
		}

		return {
			containerRef,
			renderedCard,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
</style>
