<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span v-if="!requestInFlight">{{ $locale.get('ui.decks.shareDeck') }}</span>
			<span v-if="requestInFlight">{{ $locale.get('ui.decks.shareDeck.progress') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import Notifications from '@/utils/Notifications'

export default Vue.extend({
	data: () => ({
		requestInFlight: false,
	}),

	computed: {},

	methods: {
		async onClick(): Promise<void> {
			this.requestInFlight = true
			const deckId = this.$route.params.deckId
			const response = await axios.post(`/api/decks/${deckId}/share`)
			const statusCode = response.status
			if (statusCode === 200) {
				const shareCode = response.data.data
				const shareLink = `${location.origin}/ds/${shareCode}`
				this.copyToClipboard(shareLink)
				Notifications.success('Share link copied to clipboard!')
			} else {
				Notifications.error('An error occurred while creating a share link')
			}
			this.requestInFlight = false
		},

		copyToClipboard(value: string): void {
			const el = document.createElement('textarea')
			el.value = value
			document.body.appendChild(el)
			el.select()
			document.execCommand('copy')
			document.body.removeChild(el)
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';
</style>
