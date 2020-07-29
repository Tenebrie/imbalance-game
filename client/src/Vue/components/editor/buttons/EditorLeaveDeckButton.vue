<template>
	<div class="button-container">
		<button class="secondary" @click="onClick">
			<span>{{ $locale.get('ui.decks.leaveDeck') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	methods: {
		onClick(): void {
			this.$router.push({ name: 'decks' })
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";
</style>
