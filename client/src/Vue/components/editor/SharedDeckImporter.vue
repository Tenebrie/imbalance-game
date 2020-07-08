<template>
	<div class="shared-deck-importer">
		Importing...
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'

export default Vue.extend({
	computed: {
		sharedCode(): string {
			return this.$route.params.id
		}
	},

	async created(): Promise<void> {
		const response = await axios.post('/api/decks', {
			sharedCode: this.sharedCode
		})
		if (response.status !== 200) {
			return
		}

		const deck = response.data.deck as PopulatedEditorDeck

		await this.$router.push({
			name: 'single-deck',
			params: {
				id: deck.id
			}
		})
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";


</style>
