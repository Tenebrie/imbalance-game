<template>
	<span>
		<button class="deck-link" @click="onClick">
			<span v-if="!requestInFlight"><i class="fas fa-plus" /> Create New Deck...</span>
			<span v-if="requestInFlight"><progress-spinner /> {{ $locale.get('ui.editor.deck.create.progress') }}</span>
		</button>
	</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Notifications from '@/utils/Notifications'
import ProgressSpinner from '@/Vue/components/utils/ProgressSpinner.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { ProgressSpinner },

	data: () => ({
		requestInFlight: false,
	}),

	methods: {
		async onClick(): Promise<void> {
			this.requestInFlight = true

			try {
				const response = await store.dispatch.editor.createDeck()

				store.dispatch.popupModule.closeAll()

				await this.$router.push({
					name: 'single-deck',
					params: {
						deckId: response.deckId,
					},
				})
			} catch (e) {
				Notifications.error('An error occurred while creating the deck')
			}
			this.requestInFlight = false
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.deck-link {
	padding: 8px 16px;
	text-align: start;
	cursor: pointer;
	display: flex;
	align-items: center;
	min-height: 1.4em;
	background: none;
	border: none;
	font-size: 1.4em;
	color: darken(white, 0);
	width: 100%;
	justify-content: center;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}
}
</style>
