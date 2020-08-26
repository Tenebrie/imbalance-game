<template>
	<div class="pixi-library-card" ref="containerRef" />
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import {ref} from '@vue/composition-api'
import CardMessage from '@shared/models/network/CardMessage'

const setup = () => {
	const containerRef = ref<HTMLDivElement>()

	return {
		containerRef,
	}
}

export default Vue.extend({
	setup: setup,

	props: {
		card: {
			type: Object as () => Card | null,
		},
		verticalOffset: {
			type: Number as () => Number,
		}
	},

	data: () => ({
		isImageAppended: false as boolean
	}),

	watch: {
		renderedCard(newValue: RenderedEditorCard | null): void {
			if (newValue === null) {
				return
			}

			this.appendImageNode()
		},

		watchedCard(): void {
			this.appendImageNode()
		}
	},

	mounted() {
		if (this.renderedCard) {
			this.appendImageNode()
		} else if (this.card) {
			store.dispatch.editor.requestRender({
				card: this.card
			})
		}
	},

	computed: {
		renderedCard(): RenderedEditorCard | null {
			if (!this.watchedCard) {
				return null
			}
			return store.state.editor.renderedCards.find(renderedCard => renderedCard.class === this.watchedCard.class) || null
		},

		watchedCard(): Card | null {
			return this.card
		}
	},

	methods: {
		appendImageNode(): void {
			if (this.isImageAppended) {
				return
			}
			this.isImageAppended = true
			while (this.containerRef.children.length > 0) {
				this.$el.removeChild(this.$el.children[0])
			}

			if (this.renderedCard) {
				const node = this.renderedCard.render.cloneNode()
				node.style.position = 'absolute'
				node.style.width = '100%'
				node.style.height = '100%'
				node.style.left = '0'
				if (typeof(this.verticalOffset) === 'number') {
					node.style.top = `${this.verticalOffset}px`
				}
				this.containerRef.appendChild(node)
			}
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";
</style>
