<template>
	<keep-alive>
		<div class="admin-cards-view" v-if="hasLoaded" :onscroll="onScroll" ref="scrollerRef">
			<div v-for="category in cards" :key="category.set">
				<h2>{{ category.name }}</h2>
				<admin-cards-table :card-messages="category.cards" />
			</div>
		</div>
	</keep-alive>
</template>

<script lang="ts">
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardMessage from '@shared/models/network/card/CardMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { cardColorToString, cardFactionToString, cardTypeToString, enumKeys } from '@shared/Utils'
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'

import Localization from '@/Pixi/Localization'
import { parseRichText } from '@/utils/RichTextParser'
import AdminCardsTable from '@/Vue/components/admin/AdminCardsTable.vue'

import usePreserveTableScrollState from './utils/usePreserveTableScrollState'

export type FilterType = 'name' | 'type' | 'color' | 'faction' | 'collectible'

export type AdminViewCardCategory = {
	set: ExpansionSet
	name: string
	cards: ExtendedCardMessage[]
}

export type ExtendedCardMessage = CardMessage & {
	parsedName: string
	parsedTitle: string
	readableType: string
	readableColor: string
	readableFaction: string
	localizedType: string
	localizedColor: string
	localizedFaction: string
}

export default defineComponent({
	components: { AdminCardsTable },
	setup() {
		const hasLoaded = ref(false)
		const cards = ref<AdminViewCardCategory[]>([])

		const { onScroll, scrollerRef, restoreScrollState } = usePreserveTableScrollState()

		const loadData = async () => {
			const response = await axios.get('/api/admin/cards')
			const responseCards = response.data as OpenCardMessage[]
			const loadedCards = responseCards.map((card) => ({
				...card,
				parsedName: parseRichText(Localization.getCardName(card), card.variables).humanReadableText,
				parsedTitle: parseRichText(Localization.getCardTitle(card) || '', card.variables).humanReadableText,
				readableType: cardTypeToString(card.type),
				readableColor: cardColorToString(card.color),
				readableFaction: cardFactionToString(card.faction),
				localizedType: Localization.get(`card.type.${card.type}`),
				localizedColor: Localization.get(`card.color.${card.color}`),
				localizedFaction: Localization.get(`card.faction.${card.faction}`),
			}))

			const cardCategories: AdminViewCardCategory[] = []
			loadedCards.forEach((card) => {
				const matchingCategory = cardCategories.find((category) => category.set === card.expansionSet)
				if (matchingCategory) {
					matchingCategory.cards.push(card)
				} else {
					const name = enumKeys(ExpansionSet)[card.expansionSet]
					const recapitalizedName = name.slice(0, 1) + name.slice(1).toLowerCase()
					cardCategories.push({
						set: card.expansionSet,
						name: recapitalizedName,
						cards: [card],
					})
				}
			})
			cards.value = cardCategories

			hasLoaded.value = true
			restoreScrollState()
		}

		onMounted(() => {
			loadData()
		})

		return {
			hasLoaded,
			cards,
			onScroll,
			scrollerRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-cards-view {
	overflow-y: scroll;
}
</style>
