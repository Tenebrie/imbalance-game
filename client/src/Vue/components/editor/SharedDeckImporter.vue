<template>
	<div class="shared-deck-importer">
		Importing...
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import Notifications from '@/utils/Notifications'
import {onMounted} from '@vue/composition-api'

function Setup() {
	onMounted(async () => {
		try {
			await importDeck()
		} catch (e) {
			Notifications.error('Unable to import deck!')
		}
	})

	const importDeck = async (): Promise<void> => {
		const response = await axios.post('/api/decks', {
			sharedCode: this.$route.params.id
		})

		const deck = response.data.deck as PopulatedEditorDeck

		await this.$router.push({
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
