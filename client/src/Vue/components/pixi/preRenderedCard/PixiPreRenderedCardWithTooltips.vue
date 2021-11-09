<template>
	<pixi-pre-rendered-card :card="card" />
	<div class="tooltip-container" v-if="renderedCard">
		<card-tooltip v-for="(tooltip, index) in renderedCard.tooltips" :key="index" :card="card" :tooltip="tooltip" />
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent } from 'vue'

import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import { getCardMessageKey } from '@/utils/Utils'
import PixiPreRenderedCard from '@/Vue/components/pixi/preRenderedCard/PixiPreRenderedCard.vue'
import CardTooltip from '@/Vue/components/pixi/preRenderedCard/tooltip/CardTooltip.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { PixiPreRenderedCard, CardTooltip },
	props: {
		card: {
			type: Object as () => CardMessage | null,
		},
	},

	setup(props) {
		const renderedCard = computed<RenderedEditorCard | null>(() => {
			const card = props.card
			if (!card) {
				return null
			}
			const cardKey = getCardMessageKey(card)
			return store.state.editor.renderedCards.find((renderedCard) => renderedCard.key === cardKey) || null
		})

		return {
			renderedCard,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.tooltip-container {
	position: absolute;
	left: calc(50% + 0px);
	bottom: 0;
}
</style>
