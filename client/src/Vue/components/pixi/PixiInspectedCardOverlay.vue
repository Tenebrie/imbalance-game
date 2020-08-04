<template>
	<div class="pixi-inspected-card-overlay" v-if="this.inspectedCard" :style="positionStyle">
		{{ descriptionText }}
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Localization from '@/Pixi/Localization'
import {computed} from '@vue/composition-api'
import {CARD_ASPECT_RATIO, CARD_HEIGHT, CARD_WIDTH} from '@/Pixi/renderer/RendererUtils'
import Core from '@/Pixi/Core'
import {INSPECTED_CARD_WINDOW_FRACTION} from '@/Pixi/renderer/InspectedCardRenderer'

const setup = () => {
	const inspectedCard = computed(() => store.getters.gameStateModule.inspectedCard)

	const text = computed(() => {
		const card = inspectedCard.value
		let value = `Base Power: *${card.basePower}* | Max Power: *${card.maxPower}*\n`
		if (card.armor > 0 || card.baseArmor > 0 || card.maxArmor > 0) {
			value += `\nBase Armor: *${card.baseArmor}* | Max Armor: *${card.maxArmor}*\n`
		}
		if (card.buffs.buffs.length > 0) {
			value += '\n*Buffs:*'
		}
		card.buffs.buffs.forEach(buff => {
			value += `\n*${buff.intensity}*x *${Localization.get(buff.name)}*: ${Localization.get(buff.description)}`
		})
		return value
	})

	const cardHeight = computed(() => {
		const inspectedCard = store.getters.gameStateModule.inspectedCard
		if (!inspectedCard) {
			return 0
		}
		return Core.renderer.pixi.view.height * INSPECTED_CARD_WINDOW_FRACTION
	})
	const cardWidth = computed(() => {
		const inspectedCard = store.getters.gameStateModule.inspectedCard
		if (!inspectedCard) {
			return 0
		}
		return cardHeight.value * CARD_ASPECT_RATIO
	})

	return {
		cardWidth,
		cardHeight,
		descriptionText: text,
		inspectedCard,
	}
}

export default {
	setup: setup,
	computed: {
		positionStyle() {
			return {
				top: `calc(50% - ${this.cardHeight / 2}px`,
				left: `calc(50% + ${this.cardWidth / 2}px`,
			}
		}
	}
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.pixi-inspected-card-overlay {
		position: absolute;
		background: black;
		margin-top: 8px;
	}
</style>
