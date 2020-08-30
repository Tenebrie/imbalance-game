<template>
	<div class="the-card-library-item" :class="customClass" @click="onClick" @contextmenu="onRightClick">
		<pixi-pre-rendered-card :card="card" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import Utils from '@/utils/Utils'
import CardColor from '@shared/enums/CardColor'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import CardType from '@shared/enums/CardType'
import CardMessage from '@shared/models/network/CardMessage'

export default Vue.extend({
	components: {
		PixiPreRenderedCard
	},

	props: {
		card: {
			type: Object as () => CardMessage | null,
			required: true
		},

		mode: {
			type: String as () => 'library' | 'inspect',
			required: true
		}
	},

	computed: {
		renderedCard(): RenderedEditorCard | null {
			return store.state.editor.renderedCards.find(renderedCard => renderedCard.class === this.card.class)
		},

		isDisabled(): boolean {
			const currentDeckId = store.state.editor.currentDeckId
			if (!currentDeckId || this.mode === 'inspect') {
				return false
			}

			return !Utils.canAddCardToDeck(currentDeckId, this.card)
		},

		customClass(): {} {
			return {
				'disabled': this.isDisabled,
				'leader': this.card.color === CardColor.LEADER,
				'golden': this.card.color === CardColor.GOLDEN,
				'silver': this.card.color === CardColor.SILVER,
				'bronze': this.card.color === CardColor.BRONZE,
				'token': this.card.color === CardColor.TOKEN,
				'spell': this.card.type === CardType.SPELL
			}
		}
	},

	methods: {
		onClick(): void {
			const deckId = this.$route.params.deckId
			if (this.mode === 'inspect' || !deckId) {
				this.onRightClick()
				return
			}

			store.dispatch.editor.addCardToDeck({
				deckId: deckId,
				cardToAdd: this.card
			})
		},

		onRightClick(event: MouseEvent): void {
			if (event && (event.shiftKey || event.ctrlKey)) {
				return
			}

			store.dispatch.inspectedCard.setCard({
				card: this.card,
			})
		},
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library-item {
		position: relative;
		width: calc(#{$CARD_WIDTH} / 2);
		height: calc(#{$CARD_HEIGHT} / 2);
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
			width: calc(#{$CARD_WIDTH} / 2 - 8px);
			height: calc(#{$CARD_HEIGHT} / 2 - 8px);
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

		&.token {
			&::before {
				box-shadow: gray 0 0 8px 4px;
			}
		}

		&.spell {
			&::before {
				box-shadow: blue 0 0 8px 4px;
			}
		}

		/deep/
		img {
			position: relative;
			height: 100%;
		}
	}
</style>
