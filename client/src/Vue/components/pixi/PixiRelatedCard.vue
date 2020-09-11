<template>
	<the-card-library-item :card="this.card" :mode="'inspect'" />
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import CardMessage from '@shared/models/network/card/CardMessage'

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
		card(): CardMessage | null {
			return store.state.editor.cardLibrary.find(card => card.class === this.cardClass)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";
</style>
