<template>
	<div class="admin-cards-view" v-if="hasLoaded">
		<table class="cards-table">
			<thead>
				<tr>
					<th @click="() => sortBy('name')">Name</th>
					<th @click="() => sortBy('type')">Type</th>
					<th @click="() => sortBy('color')">Color</th>
					<th @click="() => sortBy('faction')">Faction</th>
					<th @click="() => sortBy('collectible')">Collectible</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="card in cards" :key="card.class">
					<td>
						<router-link :to="`/admin/cards/${card.class}`"
							>{{ card.parsedName }}{{ card.parsedTitle ? `, ${card.parsedTitle}` : '' }}</router-link
						>
					</td>
					<td>
						<span :class="`card-type ${card.readableType}`" v-html="card.localizedType" />
					</td>
					<td>
						<span :class="`card-color ${card.readableColor}`" v-html="card.localizedColor" />
					</td>
					<td>
						<span :class="`card-faction ${card.readableFaction}`" v-html="card.localizedFaction" />
					</td>
					<td>
						{{ card.isCollectible }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted, ref } from 'vue'
import AccessLevel from '@shared/enums/AccessLevel'
import moment from 'moment'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import { cardTypeToString, cardColorToString, cardFactionToString } from '@shared/Utils'
import { parseRichText } from '@/utils/RichTextParser'
import Localization from '@/Pixi/Localization'
import store from '@/Vue/store'
import TheCardPreviewPopup from '../popup/escapeMenu/TheCardPreviewPopup.vue'

type FilterType = 'name' | 'type' | 'color' | 'faction' | 'collectible'

type ExtendedCardMessage = CardMessage & {
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
	setup() {
		const hasLoaded = ref(false)
		const cards = ref<ExtendedCardMessage[]>([])

		const loadData = async () => {
			const response = await axios.get('/api/admin/cards')
			const responseCards = response.data as OpenCardMessage[]
			cards.value = responseCards.map((card) => ({
				...card,
				parsedName: parseRichText(Localization.get(card.name), card.variables).humanReadableText,
				parsedTitle: parseRichText(Localization.getValueOrNull(card.title) || '', card.variables).humanReadableText,
				readableType: cardTypeToString(card.type),
				readableColor: cardColorToString(card.color),
				readableFaction: cardFactionToString(card.faction),
				localizedType: Localization.get(`card.type.${card.type}`),
				localizedColor: Localization.get(`card.color.${card.color}`),
				localizedFaction: Localization.get(`card.faction.${card.faction}`),
			}))
			sortCards()
			hasLoaded.value = true
		}

		onMounted(() => {
			loadData()
		})

		const onPreview = async (card: ExtendedCardMessage) => {
			store.dispatch.popupModule.open({
				component: TheCardPreviewPopup,
				params: {
					cardClass: card.class,
				},
			})
		}

		type SortStackEntry = {
			type: FilterType
			isReversed: boolean
		}
		const sortStack = ref<SortStackEntry[]>([
			{
				type: 'collectible',
				isReversed: false,
			},
			{
				type: 'faction',
				isReversed: false,
			},
			{
				type: 'color',
				isReversed: false,
			},
			{
				type: 'type',
				isReversed: false,
			},
			{
				type: 'name',
				isReversed: false,
			},
		])

		const modifyFilter = (type: FilterType): void => {
			const last = sortStack.value[sortStack.value.length - 1]
			if (last.type === type) {
				last.isReversed = !last.isReversed
			} else {
				sortStack.value = sortStack.value.filter((sorter) => sorter.type !== type)
				sortStack.value.push({
					type,
					isReversed: false,
				})
			}
		}

		const sortBy = (type: FilterType) => {
			modifyFilter(type)
			sortCards()
		}

		const sortCards = () => {
			sortStack.value.forEach((sorter) => {
				if (sorter.type === 'name' && !sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => a.parsedName.localeCompare(b.parsedName))
				} else if (sorter.type === 'name' && sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => b.parsedName.localeCompare(a.parsedName))
				} else if (sorter.type === 'type' && !sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => a.type - b.type)
				} else if (sorter.type === 'type' && sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => b.type - a.type)
				} else if (sorter.type === 'color' && !sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => a.color - b.color)
				} else if (sorter.type === 'color' && sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => b.color - a.color)
				} else if (sorter.type === 'faction' && !sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => a.faction - b.faction)
				} else if (sorter.type === 'faction' && sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => b.faction - a.faction)
				} else if (sorter.type === 'collectible' && !sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => Number(a.isCollectible) - Number(b.isCollectible))
				} else if (sorter.type === 'collectible' && sorter.isReversed) {
					cards.value = cards.value.sort((a, b) => Number(b.isCollectible) - Number(a.isCollectible))
				}
			})
		}

		return {
			moment,
			hasLoaded,
			cards,
			onPreview,
			AccessLevel,
			sortBy,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.admin-cards-view {
	overflow-y: scroll;
}

.cards-table {
	width: 100%;
	text-align: left;
	border: none;
	border-collapse: collapse;
}

tr {
	border: none;
}
thead > tr {
	background-color: rgba(black, 0.5);
}
tr:nth-child(even) {
	background-color: rgba(white, 0.05);
}

th {
	cursor: pointer;
	user-select: none;
}

td,
th {
	padding: 12px 12px;
	text-overflow: ellipsis;
	overflow: hidden;
	width: auto;
	white-space: nowrap;
}

.user-input {
	vertical-align: bottom;
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 180px;
	white-space: nowrap;
}

.action-link {
	cursor: pointer;
	user-select: none;
}

.card-type {
	&.unit {
		color: lighten(orange, 20);
	}
	&.spell {
		color: lighten(blue, 20);
	}
}

.card-color {
	&.leader {
		color: MediumAquamarine;
	}
	&.golden {
		color: darkorange;
	}
	&.silver {
		color: #bb20bb;
	}
	&.bronze {
		color: white;
	}
	&.token {
		color: gray;
	}
}

.card-faction {
	&.human {
		color: darkgoldenrod;
	}
	&.arcane {
		color: teal;
	}
	&.wild {
		color: green;
	}
	&.neutral {
		color: gray;
	}
}
</style>
