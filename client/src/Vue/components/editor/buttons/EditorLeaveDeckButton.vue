<template>
	<div class="button-container">
		<button class="secondary" @click="onClick">
			<span>{{ $locale.get('ui.decks.leaveDeck') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import router from '@/Vue/router'

export default Vue.extend({
	methods: {
		onClick(): void {
			this.$router.push({ name: 'decks', query: router.currentRoute.query })
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';
</style>
