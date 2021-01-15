<template>
	<div class="shared-deck-importer">Importing...</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import router from '@/Vue/router'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import Notifications from '@/utils/Notifications'
import { onMounted } from '@vue/composition-api'

export default Vue.extend({
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
				sharedCode: router.currentRoute.params.deckId,
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
