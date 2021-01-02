<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span v-if="!requestInFlight">{{ $locale.get('ui.editor.deck.create') }}</span>
			<span v-if="requestInFlight">{{ $locale.get('ui.editor.deck.create.progress') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'

export default Vue.extend({
	data: () => ({
		requestInFlight: false,
	}),

	methods: {
		async onClick(): Promise<void> {
			this.requestInFlight = true
			const response = await store.dispatch.editor.createDeck()
			if (response.status !== 200) {
				this.$noty.error('An error occurred while creating the deck')
				return
			}

			await this.$router.push({
				name: 'single-deck',
				params: {
					deckId: response.deckId,
				},
			})
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';

.button-container {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	button {
		width: 80%;
		max-width: 350px;
		font-size: 1.2em;
		margin-top: 32px;
		margin-bottom: 32px;
	}
}
</style>
