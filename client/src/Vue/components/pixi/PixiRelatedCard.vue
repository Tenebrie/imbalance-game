<template>
	<the-card-library-item :card="card" :mode="'inspect'" />
</template>

<script lang="ts">
import store from '@/Vue/store'
import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import CardMessage from '@shared/models/network/card/CardMessage'
import { defineComponent } from 'vue'

export default defineComponent({
	components: {
		TheCardLibraryItem,
	},

	props: {
		cardClass: {
			type: String,
			required: true,
		},
	},

	computed: {
		card(): CardMessage | null {
			return store.state.editor.cardLibrary.find((card) => card.class === this.cardClass) || null
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';
</style>
