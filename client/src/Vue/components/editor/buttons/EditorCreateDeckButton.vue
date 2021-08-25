<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span v-if="!requestInFlight"><i class="fas fa-plus-circle" /> {{ $locale.get('ui.editor.deck.create') }}</span>
			<span v-if="requestInFlight"><progress-spinner /> {{ $locale.get('ui.editor.deck.create.progress') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Notifications from '@/utils/Notifications'
import store from '@/Vue/store'
import { defineComponent } from 'vue'
import ProgressSpinner from '../../utils/ProgressSpinner.vue'

export default defineComponent({
	components: { ProgressSpinner },

	data: () => ({
		requestInFlight: false,
	}),

	methods: {
		async onClick(): Promise<void> {
			this.requestInFlight = true
			const response = await store.dispatch.editor.createDeck()
			if (response.status !== 200) {
				Notifications.error('An error occurred while creating the deck')
				return
			}

			store.dispatch.popupModule.closeAll()

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
		width: 100%;
		font-size: 1.2em;
	}
}
</style>
