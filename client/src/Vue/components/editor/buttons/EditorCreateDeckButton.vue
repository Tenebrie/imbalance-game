<template>
	<span class="link button-link" @click="onClick">
		<span v-if="!isLoading">Create new deck</span>
		<span v-if="isLoading">Creating...</span>
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
			const response = await store.dispatch.editor.createDeck()
			if (response.status !== 200) {
				this.$noty.error('An error occurred while creating the deck')
				return
			}

			await this.$router.push({
				name: 'single-deck',
				params: {
					id: response.deckId
				}
			})
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../../styles/generic";
</style>
