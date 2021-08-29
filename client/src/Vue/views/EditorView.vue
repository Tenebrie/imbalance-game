<template>
	<div class="editor-view">
		<div class="deck-list">
			<router-view />
		</div>
		<div class="card-library">
			<the-card-library />
		</div>
		<pixi-inspected-card />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheCardLibrary from '@/Vue/components/editor/TheCardLibrary.vue'
import PixiInspectedCard from '@/Vue/components/pixi/PixiInspectedCard.vue'

export default defineComponent({
	components: { TheCardLibrary, PixiInspectedCard },
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.editor-view {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	max-width: $CONTENT_WIDTH;

	.card-library {
		flex: 1;
		margin: 0 0 0 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: 100%;
		background: $COLOR-BACKGROUND-TRANSPARENT;
	}

	$DECK-LIST-WIDTH: 410px;
	.deck-list {
		max-width: $DECK-LIST-WIDTH;
		flex-grow: 0;
		flex-shrink: 0;
		margin: 0 16px 0 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: 100%;
		background: $COLOR-BACKGROUND-TRANSPARENT;

		@media screen and (max-width: calc(#{$DECK-LIST-WIDTH} * 2)) {
			max-width: 50%;
		}
	}
}
</style>
