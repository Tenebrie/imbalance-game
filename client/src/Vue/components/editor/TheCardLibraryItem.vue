<template>
	<div class="the-card-library-item"
		 :class="customClass"
		 @click="onClick"
		 @mouseenter="onMouseEnter"
		 @mouseleave="onMouseLeave"
	/>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import Card from '@shared/models/Card'
import Utils from '@/utils/Utils'
import CardColor from '@shared/enums/CardColor'
import * as PIXI from 'pixi.js'

export default Vue.extend({
	props: {
		card: {
			type: Object as () => Card,
			required: true
		}
	},

	data: () => ({
		hoverInfoTimer: null as number | null
	}),

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
				disabled: this.isDisabled,
				'leader': this.card.color === CardColor.LEADER,
				'golden': this.card.color === CardColor.GOLDEN,
				'silver': this.card.color === CardColor.SILVER,
				'bronze': this.card.color === CardColor.BRONZE
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
		},

		onMouseEnter(): void {
			this.hoverInfoTimer = setTimeout(() => {
				const element = this.$el
				const boundingBox = element.getBoundingClientRect()
				store.dispatch.editor.inspectedCard.setCard({
					card: this.card,
					position: new PIXI.Point(boundingBox.right, boundingBox.top),
					scrollCallback: this.onParentScroll.bind(this)
				})
			}, 750)
		},

		onParentScroll(): void {
			this.onMouseLeave()
		},

		onMouseLeave(): void {
			clearTimeout(this.hoverInfoTimer)
			store.commit.editor.inspectedCard.setCard(null)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library-item {
		position: relative;
		margin: 16px;
		width: calc(408px / 2);
		height: calc(584px / 2);
		cursor: pointer;
		user-select: none;

		&.disabled {
			filter: brightness(50%);
			cursor: default;
		}

		&:hover {
			&::before {
				opacity: 1;
				transition: opacity 0s;
			}
		}

		&::before {
			position: absolute;
			content: '';
			top: 4px;
			left: 4px;
			width: calc(408px / 2 - 8px);
			height: calc(584px / 2 - 8px);
			opacity: 0;
			transition: opacity 1s;
		}

		&.leader {
			&::before {
				box-shadow: MediumAquamarine 0 0 8px 4px;
			}
		}

		&.golden {
			&::before {
				box-shadow: darkorange 0 0 8px 4px;
			}
		}

		&.silver {
			&::before {
				box-shadow: #BB20BB 0 0 8px 4px;
			}
		}

		&.bronze {
			&::before {
				box-shadow: white 0 0 8px 4px;
			}
		}

		/deep/
		img {
			position: relative;
			height: 100%;
		}
	}
</style>
