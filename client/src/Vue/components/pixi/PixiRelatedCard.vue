<template>
	<the-card-library-item :card="this.card" :mode="'inspect'" />
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'

export default Vue.extend({
	components: {
		TheCardLibraryItem
	},

	props: {
		cardClass: {
			type: String,
			required: true
		}
	},

	computed: {
		card(): Card | null {
			return store.state.editor.cardLibrary.find(card => card.class === this.cardClass)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";
</style>
