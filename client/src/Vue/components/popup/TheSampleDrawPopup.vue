<template>
	<base-popup class="popup" header="Sample draw">
		<div class="scroller-wrapper">
			<h2>Drawn hand</h2>
			<div class="scroller">
				<the-card-library-item class="card" v-for="card in displayedHandCards" :key="card.id" :card="card" mode="inspect" />
			</div>
			<div class="separator" />
			<h2>Next 5 cards</h2>
			<div class="scroller">
				<the-card-library-item class="card" v-for="card in displayedMulliganCards" :key="card.id" :card="card" mode="inspect" />
			</div>
		</div>
		<base-popup-buttons>
			<button @click="onRedraw" class="primary game-button">Draw</button>
			<button @click="onConfirm" class="primary game-button">OK</button>
		</base-popup-buttons>
	</base-popup>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import CardMessage from '@shared/models/network/card/CardMessage'
import { shuffle, sortCards } from '@shared/Utils'
import { computed, defineComponent, onMounted, ref } from 'vue'

import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import BasePopup from '@/Vue/components/popup/components/BasePopup.vue'
import BasePopupButtons from '@/Vue/components/popup/components/BasePopupButtons.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		TheCardLibraryItem,
		BasePopupButtons,
		BasePopup,
	},

	setup() {
		const deckId = computed<string>(() => store.getters.popupModule.params!.deckId)

		const deck = computed<PopulatedEditorDeck>(() => {
			return store.state.editor.decks.find((deck) => deck.id === deckId.value)!
		})

		const displayedHandCards = ref<CardMessage[]>([])
		const displayedMulliganCards = ref<CardMessage[]>([])

		const drawCards = () => {
			const expandedDeck = deck.value.cards
				.flatMap((cardWrapper) =>
					Array(cardWrapper.count)
						.fill(0)
						.map((_, index) => ({
							...cardWrapper,
							id: cardWrapper.id + `:${index}`,
						}))
				)
				.filter((card) => card.color !== CardColor.LEADER)
			const shuffledDeck = shuffle(expandedDeck)
			console.log(shuffledDeck.map((card) => card.class))
			const handCards = sortCards(shuffledDeck.slice(0, 10))
			const mulliganCards = shuffledDeck.slice(10, 15)
			displayedHandCards.value = handCards
			displayedMulliganCards.value = mulliganCards
		}

		onMounted(() => {
			drawCards()
		})

		const onRedraw = (): void => {
			drawCards()
		}

		const onConfirm = (): void => {
			store.dispatch.popupModule.close()
		}

		return {
			displayedHandCards,
			displayedMulliganCards,
			onRedraw,
			onConfirm,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

h2 {
	margin-bottom: 4px;
}

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
	width: calc(80vw - 256px);
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

.separator {
	width: 100%;
	height: 1px;
	background: gray;
	margin: 16px 0;
}
</style>
