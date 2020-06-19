<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span v-if="!requestInFlight">Save</span>
			<span v-if="requestInFlight">Saving...</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	data: () => ({
		requestInFlight: false
	}),

	computed: {

	},

	methods: {
		async onClick(): Promise<void> {
			this.requestInFlight = true
			const deckId = this.$route.params.id
			const statusCode = await store.dispatch.editor.saveDeck({ deckId })
			if (statusCode === 204) {
				this.$noty.success('Deck saved!')
			} else {
				this.$noty.error('An error occurred while saving the deck')
			}
			this.requestInFlight = false
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";
</style>
