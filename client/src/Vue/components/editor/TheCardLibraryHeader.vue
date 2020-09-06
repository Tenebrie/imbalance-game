<template>
	<div class="the-card-library-header">
		<div class="filters">
			<button
				v-for="data in this.factionData"
				:key="`faction-button-${data.faction}`"
				class="primary"
				:class="{ selected: data.faction === selectedFaction }"
				@click="() => toggleFaction(data.faction)"
			>
				{{ data.text }}
			</button>
			<inline-tooltip class="tooltip">{{ $locale.get('ui.editor.header.factions.tooltip') }}</inline-tooltip>
			<div class="separator" />
			<button
				v-for="data in this.colorData"
				:key="`color-button-${data.color}`"
				class="primary"
				:class="{ selected: data.color === selectedColor }"
				@click="() => toggleColor(data.color)"
			>
				{{ data.text }}
			</button>
			<div class="separator" />
			<div class="checkbox-container">
				<div class="checkbox">
					<input id="bigcheckbox" type="checkbox" value="Test" v-model="experimentalToggle" />
					<label for="bigcheckbox">Experimental</label>
				</div>
			</div>
		</div>
		<div class="search">
			<div class="search-input-container">
				<input type="text" :placeholder="this.$locale.get('ui.editor.library.search.placeholder')" v-model="searchQuery" />
			</div>
			<button class="secondary" @click="this.clearSearch"><i class="fas fa-times"></i></button>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import {computed, defineComponent} from '@vue/composition-api'
import {debounce} from 'throttle-debounce'
import InlineTooltip from '@/Vue/components/InlineTooltip.vue'
import {useDecksRouteQuery} from '@/Vue/components/editor/EditorRouteParams'

export default defineComponent({
	components: {
		InlineTooltip
	},
	setup() {
		const routeQuery = useDecksRouteQuery()
		const selectedColor = computed<CardColor>(() => routeQuery.value.color)
		const selectedFaction = computed<CardFaction>(() => routeQuery.value.faction)

		const toggleColor = (color: CardColor) => {
			if (selectedColor.value === color) {
				routeQuery.value.color = null
			} else {
				routeQuery.value.color = color
			}
		}

		const toggleFaction = (faction: CardFaction) => {
			if (selectedFaction.value === faction) {
				routeQuery.value.faction = null
			} else {
				routeQuery.value.faction = faction
			}
		}

		const colorData = [
			{ text: 'All', color: null },
			{ text: 'Leader', color: CardColor.LEADER },
			{ text: 'Legendary', color: CardColor.GOLDEN },
			{ text: 'Epic', color: CardColor.SILVER },
			{ text: 'Common', color: CardColor.BRONZE },
		]

		const factionData = [
			{ text: 'All', faction: null },
			{ text: 'Imperial', faction: CardFaction.HUMAN },
			{ text: 'Arcane', faction: CardFaction.ARCANE },
			{ text: 'Wild', faction: CardFaction.WILD },
			{ text: 'Neutral', faction: CardFaction.NEUTRAL },
		]

		const clearSearch = () => {
			store.commit.editor.setSearchQuery('')
		}

		const setSearchQueryDebounced = debounce(200, (query: string) => {
			store.commit.editor.setSearchQuery(query)
		})

		const experimentalToggle = computed<boolean>({
			get(): boolean {
				return routeQuery.value.experimental
			},
			set (value: boolean) {
				routeQuery.value.experimental = value
			}
		})

		const searchQuery = computed<string>({
			get(): string {
				return store.state.editor.searchQuery
			},
			set(value: string) {
				setSearchQueryDebounced(value)
			}
		})

		return {
			factionData,
			colorData,
			selectedFaction,
			selectedColor,
			toggleFaction,
			toggleColor,
			clearSearch,
			experimentalToggle,
			searchQuery
		}
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library-header {
		display: flex;
		flex-wrap: wrap;

		justify-content: space-between;
		padding: 8px;
		height: calc(100% - 16px);

		button.selected {
			color: black;
			background: darkorange;
			border-color: darkorange;
			&:hover {
				background: darken(darkorange, 5);
				border-color: darken(darkorange, 5);
			}
			&:active {
				background: darken(darkorange, 10);
				border-color: darken(darkorange, 10);
			}
		}

		.filters {
			display: flex;

			& > * {
				flex-grow: 0;
			}

			.tooltip {
				font-size: 1.2em;
			}

			.separator {
				flex-grow: 0;
				flex-shrink: 0;
				width: 1px;
				margin: 0 8px;
				background: white;
			}

			button {
				margin: 0 4px;
			}

			.checkbox-container {
				display: flex;
				align-items: center;
				justify-content: center;

				.checkbox {
					display: flex;
				}
			}
		}

		.search {
			position: relative;
			display: flex;
			min-height: 40px;

			.search-input-container {
				flex: 5;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;

				input {
					margin: 0;
					border: 1px solid darken($COLOR-TEXT, 10);
					height: 100%;
					border-radius: 0.25em 0 0 0.25em;
					border-right: none;
				}
			}

			button {
				flex: 1;
				margin: 0;
				padding: 0;
				border-radius: 0 0.25em 0.25em 0;
			}
		}
	}
</style>
