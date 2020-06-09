<template>
	<div class="the-card-library-item" @click="onClick" :class="customClass">
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import Card from '@shared/models/Card'
import Utils from '@/utils/Utils'

export default Vue.extend({
	props: {
		card: {
			type: Object as () => Card,
			required: true
		}
	},

	watch: {
		renderedCard(newValue: RenderedEditorCard | null): void {
			if (newValue === null) {
				return
			}

			newValue.render.setAttribute('draggable', 'false')
			this.$el.appendChild(newValue.render)
		}
	},

	computed: {
		renderedCard(): RenderedEditorCard | null {
			return store.state.editor.renderedCards.find(renderedCard => renderedCard.id === this.card.id)
		},

		isDisabled(): boolean {
			const currentDeckId = store.state.editor.currentDeckId
			if (!currentDeckId) {
				return false
			}

			return !Utils.canAddCardToDeck(currentDeckId, this.card)
		},

		customClass(): {} {
			return {
				disabled: this.isDisabled
			}
		}
	},

	mounted(): void {
		store.dispatch.editor.requestRender({
			card: this.card
		})
	},

	methods: {
		onClick(): void {
			const deckId = this.$route.params.id
			store.dispatch.editor.addCardToDeck({
				deckId: deckId,
				cardToAdd: this.card
			})
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library-item {
		margin: 16px;
		width: calc(408px / 2);
		height: calc(584px / 2);
		cursor: pointer;
		user-select: none;

		&.disabled {
			filter: brightness(50%);
			cursor: default;
		}

		/deep/
		img {
			width: calc(408px / 2);
		}
	}
</style>
