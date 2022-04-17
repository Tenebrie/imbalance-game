<template>
	<div class="editor-deck-card-list-separator-unfinished" :onclick="onClick">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }}</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import Localization from '@/Pixi/Localization'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'

export default defineComponent({
	setup() {
		const separatorText = computed<string>(() => Localization.get('editor.faction.unfinished'))

		const routeQuery = useDecksRouteQuery()
		const onClick = () => {
			routeQuery.value.toggleFaction(null)
		}
		return {
			separatorText,
			onClick,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-card-list-separator-unfinished {
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

	color: darken(gray, 10);
	.line {
		background: darken(gray, 10);
	}

	.text {
		display: inline-block;
		margin: 0 8px;
	}

	.line-container.left {
		width: 30px;
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
