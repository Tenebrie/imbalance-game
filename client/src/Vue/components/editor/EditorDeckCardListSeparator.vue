<template>
	<div class="editor-deck-card-list-separator" :class="colorClass" :onclick="onClick">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }} ({{ cardLimitUsed }}/{{ cardLimitTotal }})</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import { getMaxCardCountForColor } from '@shared/Utils'
import { computed, defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'
import router from '@/Vue/router'
import store from '@/Vue/store'

export default defineComponent({
	props: {
		color: {
			type: Number as PropType<CardColor>,
			required: true,
		},
	},

	setup(props) {
		const colorAsString = computed<string>((): string => {
			switch (props.color) {
				case CardColor.LEADER:
					return 'leader'
				case CardColor.GOLDEN:
					return 'golden'
				case CardColor.SILVER:
					return 'silver'
				case CardColor.BRONZE:
					return 'bronze'
				default:
					return ''
			}
		})

		const separatorText = computed((): string => {
			return Localization.get(`card.color.${colorAsString.value}`)
		})

		const cardLimitUsed = computed((): number => {
			const deckId = router.currentRoute.value.params.deckId as string
			return store.getters.editor.cardsOfColor({
				deckId: deckId,
				color: props.color,
			})
		})

		const cardLimitTotal = computed((): number => {
			return getMaxCardCountForColor(props.color)
		})

		const colorClass = computed((): any => {
			return {
				[colorAsString.value]: true,
			}
		})

		const routeQuery = useDecksRouteQuery()
		const onClick = () => {
			routeQuery.value.toggleExactColor(props.color)
		}

		return {
			colorAsString,
			separatorText,
			cardLimitUsed,
			cardLimitTotal,
			colorClass,
			onClick,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-card-list-separator {
	width: calc(100% - 16px);
	display: flex;
	flex-direction: row;
	padding: 4px 8px;
	user-select: none;
	font-size: 1.1em;
	cursor: pointer;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}

	&.leader {
		color: $COLOR_LEADER;

		.line {
			background: $COLOR_LEADER;
		}
	}

	&.golden {
		color: $COLOR_GOLDEN;

		.line {
			background: $COLOR_GOLDEN;
		}
	}

	&.silver {
		color: $COLOR_SILVER;

		.line {
			background: $COLOR_SILVER;
		}
	}

	&.bronze {
		color: $COLOR_BRONZE;

		.line {
			background: $COLOR_BRONZE;
		}
	}

	.text {
		display: inline-block;
		margin: 0 8px;
	}

	.line-container.left {
		width: 36px;
	}

	.line-container.right {
		flex: 1;
	}

	.line-container {
		width: 100px;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.line {
			width: 100%;
			border-radius: 2px;
			height: 4px;
			display: block;
		}
	}
}
</style>
