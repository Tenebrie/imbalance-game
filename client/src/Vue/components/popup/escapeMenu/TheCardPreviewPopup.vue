<template>
	<div class="the-card-preview-popup">
		<div class="the-card-preview-popup-container">
			<pixi-pre-rendered-card v-if="card" class="card" :card="card" />
		</div>
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent } from 'vue'

import store from '@/Vue/store'

import PixiPreRenderedCard from '../../pixi/preRenderedCard/PixiPreRenderedCard.vue'

export type TheCardPreviewPopupParams = {
	cardClass: string
}

export default defineComponent({
	components: { PixiPreRenderedCard },

	setup() {
		const params = store.getters.popupModule.params as TheCardPreviewPopupParams
		const card = computed<CardMessage | undefined>(() => store.state.editor.cardLibrary.find((card) => card.class === params.cardClass))

		return {
			card,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-card-preview-popup {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-card-preview-popup-container {
	border-radius: 16px;
	display: flex;
	width: calc(408px);
	height: calc(584px);
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	position: relative;
}
</style>
