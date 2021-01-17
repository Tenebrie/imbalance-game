<template>
	<div class="button-container">
		<button class="secondary" @click="onClick">
			<span>{{ $locale.get('ui.decks.leaveDeck') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import router from '@/Vue/router'
import { defineComponent } from 'vue'

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
