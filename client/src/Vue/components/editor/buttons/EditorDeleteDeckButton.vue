<template>
	<div class="button-container">
		<button class="primary destructive" @click="onClick">
			<span v-if="!isLoading">Delete</span>
			<span v-if="isLoading">Deleting...</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	data: () => ({
		isLoading: false
	}),

	computed: {

	},

	methods: {
		async onClick(): Promise<void> {
			this.isLoading = true
			const deckId = this.$route.params.id
			const statusCode = await store.dispatch.editor.deleteDeck({ deckId })
			if (statusCode === 204) {
				this.$noty.success('Deck deleted!')
				await this.$router.push({ name: 'decks' })
			} else {
				this.$noty.error('An error occurred while deleting the deck')
			}
			this.isLoading = false
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";
</style>
