<template>
	<div class="the-card-library">
		<div class="header">
			<the-card-library-header />
		</div>
		<div class="cards">
			<the-card-library-item
					:card="card"
					class="card"
					v-for="card in library"
					:key="`${userLanguage}-${card.id}`"
					:mode="'library'"
			/>
			<the-editor-inspected-card />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import Language from '@shared/models/Language'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import TheEditorInspectedCard from '@/Vue/components/editor/TheEditorInspectedCard.vue'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'
import TheCardLibraryHeader from '@/Vue/components/editor/TheCardLibraryHeader.vue'
import Localization from '@/Pixi/Localization'

export default Vue.extend({
	components: {
		TheCardLibraryItem,
		TheCardLibraryHeader,
		TheEditorInspectedCard,
	},

	computed: {
		library(): Card[] {
			const isCollectible = (card: Card): boolean => {
				return card.faction !== CardFaction.EXPERIMENTAL && card.color !== CardColor.TOKEN && card.type === CardType.UNIT
			}

			const searchQuery = store.state.editor.searchQuery
			const selectedColor = store.state.editor.selectedColorFilter
			const selectedFaction = store.state.editor.selectedFactionFilter

			return store.state.editor.cardLibrary.filter(card => isCollectible(card))
				.filter(card => searchQuery === null || Localization.get(card.name).includes(searchQuery))
				.filter(card => selectedColor === null || card.color === selectedColor)
				.filter(card => selectedFaction === null || card.faction === selectedFaction)
		},
		userLanguage(): Language {
			return store.state.userPreferencesModule.userLanguage
		},
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.header {
			width: 100%;
			height: $CARD_LIBRARY_NAVIGATION_BAR_HEIGHT;
			background: rgba(white, 0.05);
			border-bottom: 1px solid gray;
			margin-bottom: $CARD_LIBRARY_NAVIGATION_BAR_MARGIN_BOTTOM;
		}

		.cards {
			width: calc(100% - 32px);
			padding: 0 16px;
			display: grid;
			grid-template-columns: repeat(auto-fill, 230px);
			justify-content: space-between;
			overflow-y: scroll;

			.card {
				margin: 16px;
			}
		}

		.click-inspect {
			width: 100%;
			height: 100%;
		}
	}
</style>
