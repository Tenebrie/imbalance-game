<template>
	<div class="the-card-library-header">
		<div class="filters">
			<button @click="this.onImperialClick">Imperial</button>
			<button @click="this.onArcaneClick">Arcane</button>
			<button @click="this.onWildClick">Wild</button>
			<div class="separator" />
			<button @click="this.onLeaderClick">Leader</button>
			<button @click="this.onLegendaryClick">Legendary</button>
			<button @click="this.onEpicClick">Epic</button>
			<button @click="this.onCommonClick">Common</button>
		</div>
		<div class="search">
			<input type="text" @input="this.onSearchQueryInput" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'

function Setup() {
	const onImperialClick = () => {
		if (store.state.editor.selectedFactionFilter === CardFaction.CASTLE) {
			store.commit.editor.setSelectedFactionFilter(null)
		} else {
			store.commit.editor.setSelectedFactionFilter(CardFaction.CASTLE)
		}
	}
	const onArcaneClick = () => {
		if (store.state.editor.selectedFactionFilter === CardFaction.ARCANE) {
			store.commit.editor.setSelectedFactionFilter(null)
		} else {
			store.commit.editor.setSelectedFactionFilter(CardFaction.ARCANE)
		}
	}
	const onWildClick = () => {
		if (store.state.editor.selectedFactionFilter === CardFaction.NATURE) {
			store.commit.editor.setSelectedFactionFilter(null)
		} else {
			store.commit.editor.setSelectedFactionFilter(CardFaction.NATURE)
		}
	}

	const onLeaderClick = () => {
		if (store.state.editor.selectedColorFilter === CardColor.LEADER) {
			store.commit.editor.setSelectedColorFilter(null)
		} else {
			store.commit.editor.setSelectedColorFilter(CardColor.LEADER)
		}
	}
	const onLegendaryClick = () => {
		if (store.state.editor.selectedColorFilter === CardColor.GOLDEN) {
			store.commit.editor.setSelectedColorFilter(null)
		} else {
			store.commit.editor.setSelectedColorFilter(CardColor.GOLDEN)
		}
	}
	const onEpicClick = () => {
		if (store.state.editor.selectedColorFilter === CardColor.SILVER) {
			store.commit.editor.setSelectedColorFilter(null)
		} else {
			store.commit.editor.setSelectedColorFilter(CardColor.SILVER)
		}
	}
	const onCommonClick = () => {
		if (store.state.editor.selectedColorFilter === CardColor.BRONZE) {
			store.commit.editor.setSelectedColorFilter(null)
		} else {
			store.commit.editor.setSelectedColorFilter(CardColor.BRONZE)
		}
	}

	const onSearchQueryInput = (event) => {
		if (event.target.value) {
			store.commit.editor.setSearchQuery(event.target.value)
		} else {
			store.commit.editor.setSearchQuery(null)
		}
	}

	return {
		onImperialClick,
		onArcaneClick,
		onWildClick,
		onLeaderClick,
		onLegendaryClick,
		onEpicClick,
		onCommonClick,
		onSearchQueryInput
	}
}

export default Vue.extend({
	setup: Setup
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library-header {
		display: flex;
		justify-content: space-between;
		height: 100%;

		.filters {
			display: flex;

			button {
			}

			.separator {
				width: 1px;
				margin: 0 16px;
				background: white;
			}
		}

		.search {
			input {
				padding: 4px;
				margin: 0;
				height: calc(100% - 8px);
			}
		}
	}
</style>
