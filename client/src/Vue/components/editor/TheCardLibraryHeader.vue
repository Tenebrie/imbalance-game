<template>
	<div class="the-card-library-header" :class="filtersHiddenClass">
		<div class="filters" v-if="filtersVisible">
			<div class="filter-buttons">
				<button
					v-for="data in this.factionData"
					:key="`faction-button-${data.faction}`"
					class="primary"
					:class="{ selected: data.faction === selectedFaction }"
					@click="() => toggleFaction(data.faction)"
				>
					{{ data.text }}
				</button>
			</div>
			<inline-tooltip class="tooltip">{{ $locale.get('ui.editor.header.factions.tooltip') }}</inline-tooltip>
			<div class="filter-buttons">
				<button
					v-for="data in this.colorData"
					:key="`color-button-${data.color}`"
					class="primary"
					:class="{ selected: data.color === selectedColor }"
					@click="() => toggleColor(data.color)"
				>
					{{ data.text }}
				</button>
			</div>
			<div class="checkbox-container">
				<div class="checkbox">
					<input id="bigcheckbox" type="checkbox" value="Test" v-model="experimentalToggle" />
					<label for="bigcheckbox">Experimental</label>
				</div>
			</div>
		</div>
		<div class="right-side">
			<div class="search">
				<div class="search-input-container">
					<input type="text" :placeholder="this.$locale.get('ui.editor.library.search.placeholder')" v-model="searchQuery" />
				</div>
				<button class="secondary" @click="this.clearSearch"><i class="fas fa-times"></i></button>
			</div>
			<div class="hide-filters-normal">
				<button class="primary" @click="() => toggleFilters()">
					<i v-if="!filtersVisible" class="fas fa-eye"></i>
					<i v-if="filtersVisible" class="fas fa-eye-slash"></i>
				</button>
			</div>
			<div class="hide-filters-mobile">
				<button class="primary" @click="() => toggleFilters()">
					Toggle filters
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import {computed, defineComponent, ref} from '@vue/composition-api'
import {debounce} from 'throttle-debounce'
import InlineTooltip from '@/Vue/components/utils/InlineTooltip.vue'
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

		const filtersVisible = ref<boolean>(true)
		const toggleFilters = () => {
			filtersVisible.value = !filtersVisible.value
		}

		const filtersHiddenClass = computed<Record<string, boolean>>(() => ({
			'filters-hidden': !filtersVisible.value
		}))

		const colorData = [
			{ text: 'All', color: null },
			{ text: 'Leader', color: CardColor.LEADER },
			{ text: 'Legendary', color: CardColor.GOLDEN },
			{ text: 'Epic', color: CardColor.SILVER },
			{ text: 'Common', color: CardColor.BRONZE },
		]

		const factionData = [
			{ text: 'All', faction: null },
			{ text: 'Human', faction: CardFaction.HUMAN },
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
			filtersVisible,
			filtersHiddenClass,
			factionData,
			colorData,
			selectedFaction,
			selectedColor,
			toggleFaction,
			toggleColor,
			toggleFilters,
			clearSearch,
			experimentalToggle,
			searchQuery
		}
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	$MOBILE_MODE_THRESHOLD: 1240px;
	$COMPACT_MODE_THRESHOLD: 2050px;

	.the-card-library-header {
		display: flex;
		flex-wrap: wrap;
		padding: 0 8px;
		height: calc(100% - 16px);
		justify-content: space-between;

		&.filters-hidden {
			justify-content: flex-end;
		}

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
			flex-wrap: wrap;
			justify-content: flex-start;

			& > * {
			}

			.tooltip {
				font-size: 1.2em;
			}

			.filter-buttons {
				display: flex;
				margin: 8px 0;
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
				min-width: 110px;

				&:nth-child(1) {
					min-width: 50px;
				}
			}

			.checkbox-container {
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 8px 0;

				.checkbox {
					display: flex;
				}
			}

			@media (max-width: $MOBILE_MODE_THRESHOLD) {
				flex-direction: row;
				width: 100%;
				justify-content: center;
				margin-top: 8px;
				.filter-buttons {
					flex-direction: column;
					margin: 0 8px;
					width: 100%;
					button {
						margin: 4px 0;
					}
				}
			}
		}

		.right-side {
			display: flex;
			@media (max-width: $COMPACT_MODE_THRESHOLD) {
				width: 100%;
			}

			@media (max-width: $MOBILE_MODE_THRESHOLD) {
				width: 100%;
				flex-direction: column;
			}

			.search {
				position: relative;
				display: flex;
				min-height: 40px;
				margin: 8px 0;
				@media (max-width: $COMPACT_MODE_THRESHOLD) {
					width: 100%;
				}

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
					width: 40px;
					margin: 0;
					padding: 0;
					border-radius: 0 0.25em 0.25em 0;
				}

				@media (max-width: $MOBILE_MODE_THRESHOLD) {
					width: 100%;
				}
			}

			.hide-filters-normal {
				margin-top: 4px;
				margin-left: 8px;
				button {
					height: calc(100% - 12px);
				}
				@media (max-width: $MOBILE_MODE_THRESHOLD) {
					display: none;
				}
			}

			.hide-filters-mobile {
				display: none;
				width: 100%;
				margin: 8px 0;
				@media (max-width: $MOBILE_MODE_THRESHOLD) {
					display: block;
				}
			}
		}
	}
</style>
