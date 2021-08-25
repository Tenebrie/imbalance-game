<template>
	<div class="the-deck-selection">
		<div class="container" @click="onMenuClick">
			<h2>Select your deck</h2>
			<div class="no-decks-info" v-if="finishedDecks.length === 0">You don't have any decks suitable for this game mode.</div>
			<the-deck-list class="deck-list" />
			<button class="primary" v-if="finishedDecks.length > 0" @click="() => onConfirm()">Continue</button>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { computed, defineComponent } from 'vue'
import TheDeckList from '@/Vue/components/editor/TheDeckList.vue'
import Notifications from '@/utils/Notifications'
import Localization from '@/Pixi/Localization'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'

export default defineComponent({
	components: {
		TheDeckList,
	},

	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onConfirm = () => {
			if (!store.state.selectedDeckId) {
				Notifications.error(Localization.get('ui.noty.deckRequired'))
				return
			}

			store.getters.popupModule.onConfirm()
			store.dispatch.popupModule.close()
		}

		const decks = computed<PopulatedEditorDeck[]>(() => {
			return store.state.editor.decks
		})

		const finishedDecks = computed<PopulatedEditorDeck[]>(() => {
			return decks.value.filter((deck) => !deck.isDraft)
		})

		return {
			onMenuClick,
			onConfirm,
			finishedDecks,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-deck-selection {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.container {
	border-radius: 16px;
	width: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: $COLOR-BACKGROUND-TRANSPARENT;
	padding: 16px 32px;

	h2 {
		margin-bottom: 0;
	}

	button {
		width: 100%;
		margin: 8px;
	}
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: rgba(black, 0.7);
}

.no-decks-info {
	width: 100%;
	text-align: left;
	font-style: italic;
	color: gray;
}

.logo {
	height: 170px;
}
</style>
