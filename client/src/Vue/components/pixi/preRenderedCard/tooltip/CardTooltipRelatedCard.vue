<template>
	<div class="container">
		<PixiPreRenderedCard :card="card" />
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { defineComponent, PropType } from 'vue'

import PixiPreRenderedCard from '@/Vue/components/pixi/preRenderedCard/PixiPreRenderedCard.vue'

export type CardTooltipRelatedCardProps = {
	card: CardMessage
}

export default defineComponent({
	components: { PixiPreRenderedCard },
	props: {
		card: {
			type: Object as PropType<CardMessage>,
			required: true,
		},
	},

	setup() {
		return {}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.container {
	position: relative;
	width: calc(408px / 2);
	height: calc(584px / 2);
}
</style>
