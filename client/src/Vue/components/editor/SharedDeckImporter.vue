<template>
	<div class="shared-deck-importer">Importing...</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted } from 'vue'

import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import Notifications from '@/utils/Notifications'
import router from '@/Vue/router'

export default defineComponent({
	setup() {
		onMounted(async () => {
			try {
				await importDeck()
			} catch (e) {
				Notifications.error('Unable to import deck!')
				console.error('Unable to import deck', e)
			}
		})

		const importDeck = async (): Promise<void> => {
			const response = await axios.post('/api/decks', {
				sharedCode: router.currentRoute.value.params.deckId,
			})

			const deck = response.data.deck as PopulatedEditorDeck

			await router.push({
				name: 'single-deck',
				params: {
					deckId: deck.id,
				},
			})
		}
		return {}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';
</style>
