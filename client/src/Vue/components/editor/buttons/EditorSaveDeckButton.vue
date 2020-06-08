<template>
	<span class="link button-link" @click="onClick">
		<span v-if="!isLoading">Save</span>
		<span v-if="isLoading">Saving...</span>
	</span>
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
			const statusCode = await store.dispatch.editor.saveDeck({ deckId })
			if (statusCode === 204) {
				this.$noty.success('Deck saved!')
			} else {
				this.$noty.error('An error occurred while saving the deck')
			}
			this.isLoading = false
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";
</style>
