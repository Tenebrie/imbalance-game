<template>
	<div class="shared-deck-importer">
		Importing...
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import router from '@/Vue/router'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import Notifications from '@/utils/Notifications'
import {onMounted} from '@vue/composition-api'

function Setup() {
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
			sharedCode: router.currentRoute.params.id
		})

		const deck = response.data.deck as PopulatedEditorDeck

		await router.push({
			name: 'single-deck',
			params: {
				id: deck.id
			}
		})
	}
	return {}
}

export default Vue.extend({
	setup: Setup
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";


</style>
