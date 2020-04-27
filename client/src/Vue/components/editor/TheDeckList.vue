<template>
	<div class="the-deck-list">
		<router-link
				tag="span"
				class="deck-link"
				v-for="deck in decks"
				:key="deck.id"
				:to="{ path: `/decks/${deck.id}` }">
			{{ deck.name }}
		</router-link>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import EditorDeck from '@shared/models/EditorDeck'

export default Vue.extend({
	computed: {
		decks(): EditorDeck[] {
			return store.state.editor.decks
		}
	},

	created(): void {
		store.dispatch.editor.loadDecks()
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-deck-list {
		width: calc(100% - 32px);
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 16px;

		.deck-link {
			padding: 4px;
			text-align: start;
			font-size: 1.4em;
			cursor: pointer;

			&:hover {
				background: $COLOR-BACKGROUND-TRANSPARENT;
			}
		}
	}
</style>
