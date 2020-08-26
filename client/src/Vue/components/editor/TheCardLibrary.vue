<template>
	<div class="the-card-library">
		<div class="header">
			<the-card-library-header />
		</div>
		<div class="cards">
			<div v-for="card in library" :key="`${userLanguage}-${card.id}`">
				<the-card-library-item :card="card" class="card" :mode="'library'" />
			</div>
			<pixi-inspected-card />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Fuse from 'fuse.js'
import store from '@/Vue/store'
import Language from '@shared/models/Language'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import PixiInspectedCard from '@/Vue/components/pixi/PixiInspectedCard.vue'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'
import TheCardLibraryHeader from '@/Vue/components/editor/TheCardLibraryHeader.vue'
import Localization from '@/Pixi/Localization'
import CardMessage from '@shared/models/network/CardMessage'

export default Vue.extend({
	components: {
		TheCardLibraryItem,
		TheCardLibraryHeader,
		PixiInspectedCard,
	},

	mounted() {
		window.addEventListener('keydown', this.onKeyPress)
	},

	beforeDestroy() {
		window.removeEventListener('keydown', this.onKeyPress)
		store.dispatch.inspectedCard.clear()
	},

	computed: {
		library(): CardMessage[] {
			const isCollectible = (card: CardMessage): boolean => {
				return card.faction !== CardFaction.EXPERIMENTAL && card.color !== CardColor.TOKEN && card.type === CardType.UNIT
			}

			const selectedColor = store.state.editor.selectedColorFilter
			const selectedFaction = store.state.editor.selectedFactionFilter

			const results = store.state.editor.cardLibrary.filter(card => isCollectible(card))
				.filter(card => selectedColor === null || card.color === selectedColor)
				.filter(card => selectedFaction === null || card.faction === selectedFaction)
				.map(card => ({
					...card,
					localizedName: Localization.get(card.name),
					localizedTitle: Localization.get(card.title),
					localizedTribes: card.baseTribes.map(tribe => Localization.get(`card.tribe.${tribe}`)).join(' '),
					localizedFlavor: Localization.get(card.flavor),
					localizedDescription: Localization.get(card.description),
				}))

			const searchQuery = store.state.editor.searchQuery
			if (!searchQuery || searchQuery.length < 2) {
				return results
			}

			const fuse = new Fuse(results, {
				threshold: 0.4,
				useExtendedSearch: true,
				keys: [
					{
						name: 'localizedName',
						weight: 4
					},
					{
						name: 'localizedTitle',
						weight: 3
					},
					{
						name: 'localizedTribes',
						weight: 5
					},
					{
						name: 'localizedFlavor',
						weight: 1
					},
					{
						name: 'localizedDescription',
						weight: 2
					}
				]
			})

			const searchResult = fuse.search(searchQuery)
			return searchResult.map(result => result.item)
		},
		userLanguage(): Language {
			return store.state.userPreferencesModule.userLanguage
		},
	},

	methods: {
		onKeyPress(event: KeyboardEvent): void {
			if (event.key === 'Escape' && store.getters.inspectedCard.card) {
				store.dispatch.inspectedCard.undoCard()
				return
			}
			if (event.key === 'Escape' && store.state.editor.searchQuery) {
				store.commit.editor.setSearchQuery(null)
			}
		}
	}
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
			// height: $CARD_LIBRARY_NAVIGATION_BAR_HEIGHT;
			background: rgba(white, 0.05);
			border-bottom: 1px solid gray;
			// margin-bottom: $CARD_LIBRARY_NAVIGATION_BAR_MARGIN_BOTTOM;
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
