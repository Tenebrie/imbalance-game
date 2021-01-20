<template>
	<div class="the-card-library-item" :class="customClass" @click="onLeftClick" @mousedown="onMouseDown" @mouseup="onMouseUp">
		<pixi-pre-rendered-card :card="card" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import Utils from '@/utils/Utils'
import CardColor from '@shared/enums/CardColor'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import CardType from '@shared/enums/CardType'
import CardMessage from '@shared/models/network/card/CardMessage'
import { RIGHT_MOUSE_BUTTON } from '@/Pixi/input/Input'
import { computed, defineComponent, PropType, ref } from 'vue'
import router from '@/Vue/router'

export default defineComponent({
	components: {
		PixiPreRenderedCard,
	},

	props: {
		card: {
			type: Object as PropType<CardMessage | null>,
			required: true,
		},

		mode: {
			type: String as PropType<'library' | 'inspect'>,
			required: true,
		},
	},

	setup(props) {
		const onLeftClick = (event: MouseEvent): void => {
			let deckId = router.currentRoute.value.params.deckId
			if (typeof deckId === 'object') {
				deckId = deckId[0]
			}
			if (props.mode === 'inspect' || !deckId) {
				onRightClick(event)
				return
			}
			store.dispatch.editor.addCardToDeck({
				deckId: deckId,
				cardToAdd: props.card,
			})
		}

		const isRightClicking = ref(false)

		const onMouseDown = (event: MouseEvent) => {
			if (event.button === RIGHT_MOUSE_BUTTON) {
				isRightClicking.value = true
				window.setTimeout(() => (isRightClicking.value = false), 5000)
			}
		}

		const onMouseUp = (event: MouseEvent) => {
			if (event.button === RIGHT_MOUSE_BUTTON && isRightClicking.value) {
				onRightClick(event)
			}
		}

		const onRightClick = (event: MouseEvent): void => {
			if (event && event.ctrlKey) {
				return
			}

			event.cancelBubble = true
			event.preventDefault()
			store.dispatch.inspectedCard.setCard({
				card: props.card,
			})
		}

		const renderedCard = computed<RenderedEditorCard | null>(() => {
			return store.state.editor.renderedCards.find((renderedCard) => renderedCard.class === props.card.class)
		})

		const isDisabled = computed<boolean>(() => {
			const currentDeckId = store.state.editor.currentDeckId
			if (!currentDeckId || props.mode === 'inspect') {
				return false
			}

			return !Utils.canAddCardToDeck(currentDeckId, props.card)
		})

		const customClass = computed<Record<string, boolean>>(() => ({
			disabled: isDisabled.value,
			leader: props.card.color === CardColor.LEADER,
			golden: props.card.color === CardColor.GOLDEN,
			silver: props.card.color === CardColor.SILVER,
			bronze: props.card.color === CardColor.BRONZE,
			token: props.card.color === CardColor.TOKEN,
			spell: props.card.type === CardType.SPELL,
		}))

		return {
			renderedCard,
			isDisabled,
			customClass,
			onLeftClick,
			onMouseDown,
			onMouseUp,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

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
			box-shadow: #bb20bb 0 0 8px 4px;
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

	img {
		position: relative;
		height: 100%;
	}
}
</style>
