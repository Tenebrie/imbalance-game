<template>
	<div class="button-container">
		<button class="primary" @click="onClick">
			<span><i class="fas fa-vial" /> {{ $locale.get('ui.decks.sampleDraw') }}</span>
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import store from '@/Vue/store'

import TheSampleDrawPopup from '../../popup/TheSampleDrawPopup.vue'

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
			store.dispatch.popupModule.open({
				component: TheSampleDrawPopup,
				params: {
					deckId: this.deckId,
				},
			})
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';
</style>
