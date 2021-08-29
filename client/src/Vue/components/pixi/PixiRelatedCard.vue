<template>
	<the-card-library-item :card="card" :mode="'inspect'" />
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { defineComponent } from 'vue'

import TheCardLibraryItem from '@/Vue/components/editor/TheCardLibraryItem.vue'
import store from '@/Vue/store'

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
