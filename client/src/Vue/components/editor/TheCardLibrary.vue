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
	</div>
</template>

<script lang="ts">
import Fuse from 'fuse.js'
import store from '@/Vue/store'
import Language from '@shared/enums/Language'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import TheCardLibraryHeader from '@/Vue/components/editor/TheCardLibraryHeader.vue'
import Localization from '@/Pixi/Localization'
import { insertRichTextVariables, snakeToCamelCase } from '@/utils/Utils'
import CardMessage from '@shared/models/network/card/CardMessage'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import CardFeature from '@shared/enums/CardFeature'

export default defineComponent({
	components: {
		TheCardLibraryItem,
		TheCardLibraryHeader,
	},

	setup() {
		onMounted(() => {
			window.addEventListener('keydown', onKeyPress)
		})

		onUnmounted(() => {
			window.removeEventListener('keydown', onKeyPress)
			store.dispatch.inspectedCard.clear()
		})

		const onKeyPress = (event: KeyboardEvent): void => {
			if (event.key === 'Escape' && store.getters.inspectedCard.card) {
				store.dispatch.inspectedCard.undoCard()
				return
			}
			if (event.key === 'Escape' && store.state.editor.searchQuery) {
				store.commit.editor.setSearchQuery('')
			}
		}

		const userLanguage = computed<Language>(() => store.state.userPreferencesModule.userLanguage)

		const library = computed<CardMessage[]>(() => {
			const routeQuery = useDecksRouteQuery()
			const isCollectible = (card: CardMessage): boolean => {
				return card.isCollectible && card.isExperimental === routeQuery.value.experimental
			}

			const stripFormatting = (str: string): string => {
				return str.replace(/\*/g, '')
			}

			const mapLocalizedFeatures = (card: CardMessage, locale: 'current' | 'original'): string[] => {
				return card.baseFeatures
					.map((feature) => `card.feature.${snakeToCamelCase(CardFeature[feature])}.text`)
					.map((id) => (locale === 'current' ? Localization.getValueOrNull(id) : Localization.getOriginalOrNull(id)))
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
					originalName: insertRichTextVariables(Localization.getOriginalOrNull(card.name), card.variables),
					originalTitle: insertRichTextVariables(Localization.getOriginalOrNull(card.title) || '', card.variables),
					originalTribes: card.baseTribes.map((tribe) => Localization.getOriginalOrNull(`card.tribe.${tribe}`)).join(' '),
					originalFeatures: mapLocalizedFeatures(card, 'original'),
					originalFlavor: Localization.getOriginalOrNull(card.flavor),
					originalDescription: stripFormatting(insertRichTextVariables(Localization.get(card.description), card.variables)),
					localizedName: insertRichTextVariables(Localization.get(card.name), card.variables),
					localizedTitle: insertRichTextVariables(Localization.getValueOrNull(card.title) || '', card.variables),
					localizedTribes: card.baseTribes.map((tribe) => Localization.get(`card.tribe.${tribe}`)).join(' '),
					localizedFeatures: mapLocalizedFeatures(card, 'current'),
					localizedFlavor: Localization.get(card.flavor),
					localizedDescription: stripFormatting(insertRichTextVariables(Localization.get(card.description), card.variables)),
				}))

			const searchQuery = store.state.editor.searchQuery
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

	.click-inspect {
		width: 100%;
		height: 100%;
	}
}
</style>
