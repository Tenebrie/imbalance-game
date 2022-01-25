<template>
	<div class="the-card-library">
		<div class="header">
			<the-card-library-header />
		</div>
		<div class="cards">
			<div v-for="card in library" :key="`${userLanguage}-${card.id}`">
				<the-card-library-item :card="card" class="card" :mode="'library'" />
			</div>
		</div>
		<div class="empty-result" v-if="library.length === 0">
			<div class="icon"><tenebrie-logo /></div>
			<div class="text">No cards match these filters!</div>
		</div>
	</div>
</template>

<script lang="ts">
import CardFeature from '@shared/enums/CardFeature'
import Language from '@shared/enums/Language'
import CardMessage from '@shared/models/network/card/CardMessage'
import Fuse from 'fuse.js'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'

import Localization from '@/Pixi/Localization'
import { insertRichTextVariables, mergeCardFeatures, snakeToCamelCase } from '@/utils/Utils'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'
import TheCardLibraryHeader from '@/Vue/components/editor/TheCardLibraryHeader.vue'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import TenebrieLogo from '@/Vue/components/utils/TenebrieLogo.vue'
import store from '@/Vue/store'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export default defineComponent({
	components: {
		TenebrieLogo,
		TheCardLibraryItem,
		TheCardLibraryHeader,
	},

	setup() {
		onMounted(() => {
			window.addEventListener('keydown', onKeyPress)
		})

		onUnmounted(() => {
			window.removeEventListener('keydown', onKeyPress)
			InspectedCardStore.dispatch.clear()
		})

		const routeQuery = useDecksRouteQuery()

		const onKeyPress = (event: KeyboardEvent): void => {
			if (event.key === 'Escape' && InspectedCardStore.getters.card) {
				InspectedCardStore.dispatch.undoCard()
				return
			}
			if (event.key === 'Escape' && routeQuery.value.searchQuery) {
				routeQuery.value.searchQuery = ''
			}
		}

		const userLanguage = computed<Language>(() => store.state.userPreferencesModule.userLanguage)

		const library = computed<CardMessage[]>(() => {
			const isCollectible = (card: CardMessage): boolean => {
				return (
					card.isCollectible && card.isCommunity === routeQuery.value.community && card.isExperimental === routeQuery.value.experimental
				)
			}

			const stripFormatting = (str: string): string => {
				return str.replace(/\*/g, '')
			}

			const mapLocalizedFeatures = (card: CardMessage, locale: 'current' | 'original'): string[] => {
				return mergeCardFeatures(card.baseFeatures, card.buffs.buffs)
					.map((feature) => `card.feature.${snakeToCamelCase(CardFeature[feature])}.text`)
					.map((id) => (locale === 'current' ? Localization.get(id) : Localization.getOriginal(id)))
					.filter((string) => string !== null) as string[]
			}

			const selectedColor = routeQuery.value.color
			const selectedFaction = routeQuery.value.faction

			const results = store.state.editor.cardLibrary
				.filter((card) => isCollectible(card))
				.filter((card) => selectedColor === null || selectedColor.includes(card.color))
				.filter((card) => selectedFaction === null || selectedFaction.includes(card.faction))
				.map((card) => ({
					...card,
					originalName: insertRichTextVariables(Localization.get(card.localization.en.name, 'key'), card.variables),
					originalTitle: insertRichTextVariables(Localization.get(card.localization.en.title, 'null'), card.variables),
					originalTribes: card.baseTribes.map((tribe) => Localization.getOriginal(`card.tribe.${tribe}`)).join(' '),
					originalFeatures: mapLocalizedFeatures(card, 'original'),
					originalFlavor: Localization.get(card.localization.en.flavor, 'null'),
					originalDescription: stripFormatting(
						insertRichTextVariables(Localization.get(card.localization.en.description, 'key'), card.variables)
					),
					localizedName: insertRichTextVariables(Localization.getCardName(card), card.variables),
					localizedTitle: insertRichTextVariables(Localization.getCardTitle(card) || '', card.variables),
					localizedTribes: card.baseTribes.map((tribe) => Localization.get(`card.tribe.${tribe}`, 'key')).join(' '),
					localizedFeatures: mapLocalizedFeatures(card, 'current'),
					localizedFlavor: Localization.getCardFlavor(card),
					localizedDescription: stripFormatting(insertRichTextVariables(Localization.getCardDescription(card), card.variables)),
				}))

			const searchQuery = routeQuery.value.searchQuery
			if (!searchQuery) {
				return results
			}

			const fuse = new Fuse(results, {
				threshold: 0.3,
				ignoreLocation: true,
				findAllMatches: true,
				includeMatches: true,
				includeScore: true,
				keys: [
					{
						name: 'originalName',
						weight: 10,
					},
					{
						name: 'originalTitle',
						weight: 10,
					},
					{
						name: 'originalTribes',
						weight: 10,
					},
					{
						name: 'originalFeatures',
						weight: 10,
					},
					{
						name: 'originalFlavor',
						weight: 1,
					},
					{
						name: 'originalDescription',
						weight: 9,
					},
					{
						name: 'localizedName',
						weight: 10,
					},
					{
						name: 'localizedTitle',
						weight: 10,
					},
					{
						name: 'localizedTribes',
						weight: 10,
					},
					{
						name: 'localizedFeatures',
						weight: 10,
					},
					{
						name: 'localizedFlavor',
						weight: 1,
					},
					{
						name: 'localizedDescription',
						weight: 9,
					},
				],
			})

			const searchResult = fuse.search(searchQuery)
			return searchResult.map((result) => result.item as CardMessage)
		})

		return {
			library,
			userLanguage,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-card-library {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;

	.header {
		width: 100%;
		background: rgba(white, 0.05);
		border-bottom: 1px solid gray;
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

	.empty-result {
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

	.click-inspect {
		width: 100%;
		height: 100%;
	}
}
</style>
