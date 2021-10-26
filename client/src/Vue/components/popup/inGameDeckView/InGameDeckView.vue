<template>
	<base-popup class="popup" :header="header">
		<div class="scroller-wrapper">
			<div class="scroller" v-if="!isLoading">
				<the-card-library-item class="card" v-for="card in displayedCards" :key="card.id" :card="card" mode="inspect" />
			</div>
			<div class="loading-state" v-if="isLoading">
				<progress-spinner class="spinner" />
			</div>
			<div class="empty-state" v-if="!isLoading && displayedCards.length === 0">
				<div class="icon"><tenebrie-logo /></div>
				<div class="text">No cards to see here!</div>
			</div>
		</div>
		<base-popup-buttons>
			<button @click="onConfirm" class="primary game-button">OK</button>
		</base-popup-buttons>
	</base-popup>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { sortCards } from '@shared/Utils'
import axios from 'axios'
import { computed, defineComponent, onMounted, PropType, ref } from 'vue'

import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import BasePopup from '@/Vue/components/popup/components/BasePopup.vue'
import BasePopupButtons from '@/Vue/components/popup/components/BasePopupButtons.vue'
import { DeckViewMode } from '@/Vue/components/popup/inGameDeckView/InGameDeckViewUtils'
import ProgressSpinner from '@/Vue/components/utils/ProgressSpinner.vue'
import TenebrieLogo from '@/Vue/components/utils/TenebrieLogo.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		ProgressSpinner,
		TenebrieLogo,
		TheCardLibraryItem,
		BasePopupButtons,
		BasePopup,
	},

	props: {
		mode: {
			type: Number as PropType<DeckViewMode>,
			required: true,
		},
	},

	setup(props) {
		const header = computed<string>(() => {
			switch (props.mode) {
				case DeckViewMode.PLAYER_DECK:
					return 'Your deck'
				case DeckViewMode.PLAYER_GRAVEYARD:
					return 'Your graveyard'
				case DeckViewMode.OPPONENT_GRAVEYARD:
					return "Opponent's graveyard"
			}
			return 'Unknown'
		})

		const loadingUrl = computed<string>(() => {
			switch (props.mode) {
				case DeckViewMode.PLAYER_DECK:
					return '/api/game/deck'
				case DeckViewMode.PLAYER_GRAVEYARD:
					return '/api/game/graveyard'
				case DeckViewMode.OPPONENT_GRAVEYARD:
					return '/api/game/opponent/graveyard'
			}
			throw new Error(`Unknown mode ${props.mode}`)
		})

		const isLoading = ref<boolean>(true)
		const displayedCards = ref<CardMessage[]>([])

		onMounted(async () => {
			try {
				const response = await axios.get(loadingUrl.value)
				displayedCards.value = sortCards(response.data as CardMessage[])
				isLoading.value = false
			} catch (e) {
				console.error(e)
			}
		})

		const onConfirm = (): void => {
			store.dispatch.popupModule.close()
		}

		return {
			header,
			isLoading,
			displayedCards,
			onConfirm,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.card-wrapper {
	position: relative;
	width: calc(#{$CARD_WIDTH} / 2);
	height: calc(#{$CARD_HEIGHT} / 2);
	cursor: pointer;
	user-select: none;

	.card {
		margin: 16px;
	}
}

.loading-state {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;

	.spinner {
		font-size: 3em;
	}
}

.empty-state {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	font-size: 2em;

	.logo {
		user-select: none;
		height: 200px;
	}
}

.scroller-wrapper {
	width: calc(100vw - 256px);
	height: calc(100vh - 256px);
	overflow-y: scroll;
	padding: 0 8px;

	.scroller {
		display: grid;
		grid-template-columns: repeat(auto-fill, 230px);
		justify-content: space-between;

		.card {
			margin: 16px;
		}
	}
}
</style>
