<template>
	<div class="the-card-library-header" :class="filtersHiddenClass">
		<div class="filters" v-if="filtersVisible">
			<div class="filter-buttons">
				<button
					v-for="data in factionData"
					:key="`faction-button-${data.faction}`"
					class="primary"
					:class="{ selected: selectedFaction?.includes(data.faction) || selectedFaction === data.faction }"
					@click="() => toggleFaction(data.faction)"
				>
					{{ data.text }}
				</button>
				<div class="vertical-separator" />
			</div>
			<div class="filter-buttons">
				<button
					v-for="data in colorData"
					:key="`color-button-${data.color}`"
					class="primary"
					:class="{ selected: selectedColor?.includes(data.color) || selectedColor === data.color }"
					@click="() => toggleColor(data.color)"
				>
					{{ data.text }}
				</button>
				<div class="vertical-separator" />
			</div>
			<div class="checkbox-container">
				<div class="checkbox">
					<input id="checkbox-community" type="checkbox" value="Community" v-model="communityToggle" />
					<label for="checkbox-community">{{ $locale.get('filter.community') }}</label>
				</div>
				<div class="checkbox">
					<input id="checkbox-experimental" type="checkbox" value="Experimental" v-model="experimentalToggle" />
					<label for="checkbox-experimental">{{ $locale.get('filter.experimental') }}</label>
				</div>
			</div>
		</div>
		<div class="right-side">
			<div class="search">
				<div class="search-input-container">
					<input type="text" :placeholder="$locale.get('ui.editor.library.search.placeholder')" v-model="searchQuery" />
				</div>
				<button class="secondary" @click="clearSearch"><i class="fas fa-times"></i></button>
			</div>
			<div class="hide-filters-normal">
				<button class="primary" @click="() => toggleFilters()">
					<i v-if="!filtersVisible" class="fas fa-eye"></i>
					<i v-if="filtersVisible" class="fas fa-eye-slash"></i>
				</button>
			</div>
			<div class="hide-filters-mobile">
				<button class="primary" @click="() => toggleFilters()">Toggle filters</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import { debounce } from 'throttle-debounce'
import { computed, defineComponent, ref } from 'vue'

import Localization from '@/Pixi/Localization'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'

export default defineComponent({
	setup() {
		const routeQuery = useDecksRouteQuery()
		const selectedColor = computed<CardColor[] | null>(() => routeQuery.value.color)
		const selectedFaction = computed<CardFaction[] | null>(() => routeQuery.value.faction)

		const filtersVisible = ref<boolean>(true)
		const toggleFilters = () => {
			filtersVisible.value = !filtersVisible.value
		}

		const filtersHiddenClass = computed<Record<string, boolean>>(() => ({
			'filters-hidden': !filtersVisible.value,
		}))

		const colorData = computed(() => [
			{ text: Localization.get('filter.all'), color: null },
			{ text: Localization.get('card.color.leader'), color: CardColor.LEADER },
			{ text: Localization.get('card.color.golden'), color: CardColor.GOLDEN },
			{ text: Localization.get('card.color.silver'), color: CardColor.SILVER },
			{ text: Localization.get('card.color.bronze'), color: CardColor.BRONZE },
		])

		const factionData = computed(() => [
			{ text: Localization.get('filter.all'), faction: null },
			{ text: Localization.get('card.faction.north'), faction: CardFaction.NORTH },
			{ text: Localization.get('card.faction.skellige'), faction: CardFaction.SKELLIGE },
			{ text: Localization.get('card.faction.scoiatael'), faction: CardFaction.SCOIATAEL },
			{ text: Localization.get('card.faction.nilfgaard'), faction: CardFaction.NILFGAARD },
			{ text: Localization.get('card.faction.monster'), faction: CardFaction.MONSTER },
			{ text: Localization.get('card.faction.neutral'), faction: CardFaction.NEUTRAL },
		])

		const clearSearch = () => {
			routeQuery.value.searchQuery = ''
		}

		const setSearchQueryDebounced = debounce(200, (query: string) => {
			routeQuery.value.searchQuery = query
		})

		const communityToggle = computed<boolean>({
			get(): boolean {
				return routeQuery.value.community
			},
			set(value: boolean) {
				routeQuery.value.community = value
			},
		})

		const experimentalToggle = computed<boolean>({
			get(): boolean {
				return routeQuery.value.experimental
			},
			set(value: boolean) {
				routeQuery.value.experimental = value
			},
		})

		const searchQuery = computed<string>({
			get(): string {
				return routeQuery.value.searchQuery
				// return store.state.editor.searchQuery
			},
			set(value: string) {
				setSearchQueryDebounced(value)
			},
		})

		return {
			filtersVisible,
			filtersHiddenClass,
			factionData,
			colorData,
			selectedFaction,
			selectedColor,
			toggleFaction: routeQuery.value.toggleFaction,
			toggleColor: routeQuery.value.toggleColor,
			toggleFilters,
			clearSearch,
			communityToggle,
			experimentalToggle,
			searchQuery,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

$MOBILE_MODE_THRESHOLD: 1300px;
$COMPACT_MODE_THRESHOLD: 10000px;

.the-card-library-header {
	display: flex;
	flex-wrap: wrap;
	padding: 0 8px;
	height: calc(100% - 16px);
	justify-content: space-between;

	&.filters-hidden {
		justify-content: flex-end;
	}

	button {
		max-height: 38px;
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

		.tooltip {
			font-size: 1.2em;
		}

		.filter-buttons {
			display: flex;
			align-items: center;
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
			min-width: fit-content;

			&:nth-child(1) {
				min-width: 50px;
			}
		}

		.checkbox-container {
			display: flex;
			align-items: flex-start;
			justify-content: center;
			flex-direction: column;
			margin: 8px 0;

			.checkbox {
				padding: 2px;
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
			align-items: center;
			min-height: 40px;
			margin: 8px 0;
			@media (max-width: $COMPACT_MODE_THRESHOLD) {
				width: 100%;
			}

			.search-input-container {
				flex: 5;
				height: 100%;
				max-height: 38px;
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
				height: 100%;
				margin: 0;
				padding: 0;
				border-radius: 0 0.25em 0.25em 0;
			}

			@media (max-width: $MOBILE_MODE_THRESHOLD) {
				width: 100%;
			}
		}

		.hide-filters-normal {
			margin-top: 3px;
			margin-bottom: 3px;
			margin-left: 8px;
			display: flex;
			align-items: center;
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

	.vertical-separator {
		display: block;
		flex: none;
		width: 1px;
		height: 100%;
		margin: 0 8px;
		background-color: $COLOR-TEXT;

		@media (max-width: $MOBILE_MODE_THRESHOLD) {
			display: none;
		}
	}
}
</style>
