<template>
	<div class="admin-card-details-view">
		<h2>Card Information</h2>
		<div class="info" v-if="hasLoaded">
			<table>
				<tr>
					<td class="header">Name:</td>
					<td>{{ card.parsedName }}</td>
				</tr>
				<tr v-if="card.parsedTitle">
					<td class="header">Title:</td>
					<td>{{ card.parsedTitle }}</td>
				</tr>
				<tr>
					<td class="header">Description:</td>
					<td>{{ card.parsedDescription }}</td>
				</tr>
				<tr>
					<td class="header">Class:</td>
					<td>{{ card.class }}</td>
				</tr>
				<tr>
					<td class="header">Type:</td>
					<td :class="`card-type ${card.readableType}`">{{ card.localizedType }}</td>
				</tr>
				<tr>
					<td class="header">Color:</td>
					<td :class="`card-color ${card.readableColor}`">{{ card.localizedColor }}</td>
				</tr>
				<tr>
					<td class="header">Faction:</td>
					<td :class="`card-faction ${card.readableFaction}`">{{ card.localizedFaction }}</td>
				</tr>
			</table>
			<div class="card-previews">
				<div class="preview-container">
					<pixi-pre-rendered-card :card="card" />
				</div>
				<div class="related-preview-container" v-for="relatedCard in card.mappedRelatedCards" :key="relatedCard.class">
					<pixi-pre-rendered-card :card="relatedCard" />
				</div>
			</div>
		</div>
		<h2>Dev Tools</h2>
		<admin-card-art-editor v-if="card" :cardClass="card.class" />
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, onMounted, ref, watch } from 'vue'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import { useAdminRouteParams } from '@/Vue/components/editor/AdminRouteParams'
import moment from 'moment'
import CardMessage from '@shared/models/network/card/CardMessage'
import { parseRichText } from '@/utils/RichTextParser'
import Localization from '@/Pixi/Localization'
import { cardColorToString, cardFactionToString, cardTypeToString } from '@shared/Utils'
import PixiPreRenderedCard from '../../pixi/PixiPreRenderedCard.vue'
import store from '@/Vue/store'
import AdminCardArtEditor from './AdminCardArtEditor.vue'

type ExtendedCardMessage = CardMessage & {
	parsedName: string
	parsedTitle: string
	parsedDescription: string
	readableType: string
	readableColor: string
	readableFaction: string
	localizedType: string
	localizedColor: string
	localizedFaction: string
	mappedRelatedCards: (CardMessage | undefined)[]
}

export default defineComponent({
	components: { PixiPreRenderedCard, AdminCardArtEditor },

	setup() {
		const hasLoaded = ref(false)
		const allGames = ref<GameHistoryDatabaseEntry[]>([])
		const card = ref<ExtendedCardMessage | null>(null)

		const params = useAdminRouteParams()

		const loadData = async () => {
			const cardResponse = await axios.get(`/api/admin/cards/${params.value.cardId}`)
			const responseCard = cardResponse.data as CardMessage
			card.value = {
				...responseCard,
				parsedName: parseRichText(Localization.get(responseCard.name), responseCard.variables).humanReadableText,
				parsedTitle: parseRichText(Localization.getValueOrNull(responseCard.title) || '', responseCard.variables).humanReadableText,
				parsedDescription: parseRichText(Localization.get(responseCard.description), responseCard.variables).humanReadableText,
				readableType: cardTypeToString(responseCard.type),
				readableColor: cardColorToString(responseCard.color),
				readableFaction: cardFactionToString(responseCard.faction),
				localizedType: Localization.get(`card.type.${responseCard.type}`),
				localizedColor: Localization.get(`card.color.${responseCard.color}`),
				localizedFaction: Localization.get(`card.faction.${responseCard.faction}`),
				mappedRelatedCards: responseCard.relatedCards.map((cardClass) =>
					store.state.editor.cardLibrary.find((card) => card.class === cardClass)
				),
			}
			hasLoaded.value = true
		}

		onMounted(() => {
			loadData()
		})

		watch(
			() => [params.value.playerId],
			() => {
				card.value = null
				hasLoaded.value = false
				loadData()
			}
		)

		return {
			card,
			moment,
			allGames,
			hasLoaded,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';

.admin-card-details-view {
	overflow-y: scroll;
	text-align: left;
}

.card-previews {
	display: grid;
	grid-template-columns: repeat(auto-fit, 204px);

	.preview-container {
		position: relative;
		width: calc(408px / 1);
		height: calc(584px / 1);
		grid-column: auto / span 2;
		grid-row: auto / span 2;
	}

	.related-preview-container {
		position: relative;
		width: calc(408px / 2);
		height: calc(584px / 2);
	}
}

.info {
	margin-left: 8px;
	margin-top: 16px;
	line-height: 1.4em;
}

.header {
	font-weight: bold;
	min-width: 200px;
}

h2 {
	margin-left: 8px;
}

.textarea-container {
	display: flex;
	textarea {
		resize: vertical;
		width: 100%;
		height: 512px;
	}
}

select {
	padding: 2px 4px;
	width: 100px;
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
