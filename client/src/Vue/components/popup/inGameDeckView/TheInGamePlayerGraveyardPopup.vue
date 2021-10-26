<template>
	<in-game-deck-view :mode="DeckViewMode.PLAYER_GRAVEYARD" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import InGameDeckView from '@/Vue/components/popup/inGameDeckView/InGameDeckView.vue'
import { DeckViewMode } from '@/Vue/components/popup/inGameDeckView/InGameDeckViewUtils'

export default defineComponent({
	components: {
		InGameDeckView,
	},

	setup() {
		return {
			DeckViewMode,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
</style>
