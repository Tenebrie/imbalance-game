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
import Vue from 'vue'
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import {computed} from '@vue/composition-api'
import {debounce} from 'throttle-debounce'

function Setup() {
	const toggleFaction = (faction: CardFaction) => {
		if (store.state.editor.selectedFactionFilter === faction) {
			store.commit.editor.setSelectedFactionFilter(null)
		} else {
			store.commit.editor.setSelectedFactionFilter(faction)
		}
	}

	const toggleColor = (color: CardColor) => {
		if (store.state.editor.selectedColorFilter === color) {
			store.commit.editor.setSelectedColorFilter(null)
		} else {
			store.commit.editor.setSelectedColorFilter(color)
		}
	}

	const selectedFaction = computed<CardFaction>(() => store.state.editor.selectedFactionFilter)
	const selectedColor = computed<CardColor>(() => store.state.editor.selectedColorFilter)

	const factionData = [
		{ text: 'All', faction: null },
		{ text: 'Imperial', faction: CardFaction.CASTLE },
		{ text: 'Arcane', faction: CardFaction.ARCANE },
		{ text: 'Wild', faction: CardFaction.NATURE },
		{ text: 'Neutral', faction: CardFaction.NEUTRAL }
	]

	const colorData = [
		{ text: 'All', color: null },
		{ text: 'Leader', color: CardColor.LEADER},
		{ text: 'Legendary', color: CardColor.GOLDEN},
		{ text: 'Epic', color: CardColor.SILVER},
		{ text: 'Common', color: CardColor.BRONZE},
	]

	const clearSearch = () => {
		store.commit.editor.setSearchQuery('')
	}

	const setSearchQueryDebounced = debounce(200, (query: string) => {
		store.commit.editor.setSearchQuery(query)
	})

	const searchQuery = computed<string>({
		get(): string {
			return store.state.editor.searchQuery
		},
		set(value: string): void {
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
		searchQuery
	}
}

export default Vue.extend({
	setup: Setup,
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

			.separator {
				width: 1px;
				margin: 0 16px;
				background: white;
			}

			button {
				margin: 0 4px;
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
