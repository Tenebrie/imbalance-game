<template>
	<div class="button-container">
		<button class="primary destructive" @click="onClick">
			<span v-if="!requestInFlight"><i class="fas fa-trash" /> {{ $locale.get('ui.decks.deleteDeck') }}</span>
			<span v-if="requestInFlight"><progress-spinner /> {{ $locale.get('ui.decks.deleteDeck.progress') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import router from '@/Vue/router'
import TheDeckDeletePopup from '@/Vue/components/popup/TheDeckDeletePopup.vue'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import { defineComponent } from 'vue'
import Notifications from '@/utils/Notifications'

export default defineComponent({
	data: () => ({
		requestInFlight: false,
	}),

	computed: {
		deckId(): string {
			return this.$route.params.deckId as string
		},

		deck(): PopulatedEditorDeck {
			return store.state.editor.decks.find((deck) => deck.id === this.deckId)!
		},
	},

	methods: {
		onClick(): void {
			const onConfirm = async () => {
				this.requestInFlight = true
				const deckId = this.deckId
				const statusCode = await store.dispatch.editor.deleteDeck({ deckId })
				if (statusCode === 204) {
					Notifications.success('Deck deleted!')
					await this.$router.push({ name: 'decks', query: router.currentRoute.value.query })
				} else {
					Notifications.error('An error occurred while deleting the deck')
				}
				this.requestInFlight = false
			}

			store.dispatch.popupModule.open({
				component: TheDeckDeletePopup,
				params: {
					deckName: this.deck.name,
				},
				onConfirm,
			})
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';
</style>
