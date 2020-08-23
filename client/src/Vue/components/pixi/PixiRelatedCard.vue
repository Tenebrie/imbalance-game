<template>
	<pixi-pre-rendered-card :card="this.card" />
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'

export default Vue.extend({
	components: {
		PixiPreRenderedCard
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
