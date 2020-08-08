<template>
	<div class="the-card-library" @scroll="onScroll">
		<the-card-library-item :card="card" class="card" v-for="card in library" :key="`${userLanguage}-${card.id}`" />
		<the-editor-inspected-card />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import Language from '@shared/models/Language'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import TheEditorInspectedCard from '@/Vue/components/editor/TheEditorInspectedCard.vue'

export default Vue.extend({
	components: {
		TheCardLibraryItem,
		TheEditorInspectedCard,
	},

	computed: {
		library(): Card[] {
			return store.state.editor.cardLibrary
		},
		userLanguage(): Language {
			return store.state.userPreferencesModule.userLanguage
		},
	},

	methods: {
		onScroll(): void {
			if (store.state.editor.inspectedCard.scrollCallback) {
				store.state.editor.inspectedCard.scrollCallback()
			}
		}
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
