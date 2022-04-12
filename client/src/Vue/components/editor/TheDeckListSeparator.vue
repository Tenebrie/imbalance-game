<template>
	<div class="editor-deck-card-list-separator" :class="factionClass" :onclick="onClick">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }}</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import CardFaction from '@shared/enums/CardFaction'
import { cardFactionToString } from '@shared/Utils'
import { computed, defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'
import DeckListMode from '@/utils/DeckListMode'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'

export default defineComponent({
	props: {
		faction: {
			type: Number as PropType<CardFaction>,
			required: true,
		},

		isExperimental: {
			type: Boolean as PropType<boolean>,
			required: true,
		},

		mode: {
			type: Number as PropType<DeckListMode>,
			required: true,
		},
	},

	setup(props) {
		const factionAsString = computed<string>(() => {
			return cardFactionToString(props.faction)
		})

		const separatorText = computed<string>(() => {
			let faction = factionAsString.value
			if (props.isExperimental) {
				faction += '.experimental'
			}
			return Localization.get(`card.faction.${faction}`)
		})

		const factionClass = computed<Record<string, boolean>>(() => ({
			[factionAsString.value]: true,
			experimental: props.isExperimental,
			clickable: props.mode === DeckListMode.EDIT,
		}))

		const routeQuery = useDecksRouteQuery()
		const onClick = () => {
			if (props.mode === DeckListMode.EDIT) {
				routeQuery.value.toggleExactFaction(props.faction)
			}
		}

		return {
			factionClass,
			separatorText,
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
	transition: background-color 0.3s;

	&.clickable {
		cursor: pointer;
	}

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}

	&.human {
		color: darkgoldenrod;

		.line {
			background: darkgoldenrod;
		}
	}

	&.arcane {
		color: teal;

		.line {
			background: teal;
		}
	}

	&.wild {
		color: green;

		.line {
			background: green;
		}
	}

	&.neutral {
		color: gray;

		.line {
			background: gray;
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
