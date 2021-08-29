<template>
	<div class="button-container">
		<button class="secondary" @click="onClick">
			<span><i class="fas fa-arrow-left" /> {{ $locale.get('ui.decks.leaveDeck') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import router from '@/Vue/router'

export default defineComponent({
	methods: {
		onClick(): void {
			this.$router.push({ name: 'decks', query: router.currentRoute.value.query })
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';
</style>
