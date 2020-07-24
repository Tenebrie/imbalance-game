<template>
	<div class="the-card-library">
		<the-card-library-item :card="card" class="card" v-for="card in library" :key="`${userLanguage}-${card.id}`" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import Language from '@shared/models/Language'

export default Vue.extend({
	components: {
		TheCardLibraryItem
	},

	computed: {
		library(): Card[] {
			return store.state.editor.cardLibrary
		},
		userLanguage(): Language {
			return store.state.userPreferencesModule.userLanguage
		}
	},

	created(): void {

	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-card-library {
		width: calc(100% - 32px);
		height: 100%;
		padding: 0 16px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 230px);
		justify-content: space-between;
		overflow-y: scroll;
	}
</style>
