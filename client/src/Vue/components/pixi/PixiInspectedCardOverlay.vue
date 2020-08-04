<template>
	<div class="pixi-inspected-card-overlay" v-if="this.inspectedCard" :style="positionStyle">
		<div class="card-base-stats">
			<div v-if="this.inspectedCard.type === CardType.UNIT" class="stats-line">
				<span>Base Power: <b>{{ this.inspectedCard.basePower }}</b></span>
				<span>Max Power: <b>{{ this.inspectedCard.maxPower }}</b></span>
			</div>
			<div v-if="this.inspectedCard.type === CardType.UNIT" class="stats-line">
				<span>Base Armor: <b>{{ this.inspectedCard.baseArmor }}</b></span>
				<span>Max Armor: <b>{{ this.inspectedCard.maxArmor }}</b></span>
			</div>
			<div v-if="this.inspectedCard.type === CardType.SPELL" class="stats-line">
				<span>Base Cost: <b>{{ this.inspectedCard.basePower }}</b></span>
			</div>
		</div>
		<div class="menu-separator" />
		<div class="card-buffs">
			<div class="buff-line" v-for="buff in this.inspectedCard.buffs.buffs" :key="buff.id">
				<span v-if="buff.intensity > 1">{{ buff.intensity }} x </span>
				<span class="buff-name">{{ $locale.get(buff.name) }}: </span>
				<span>{{ $locale.get(buff.description) }}</span>
				<span v-if="buff.duration !== Infinity"> ({{ buff.duration }} turn(s) remaining)</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import Localization from '@/Pixi/Localization'
import {computed} from '@vue/composition-api'
import {CARD_ASPECT_RATIO, getRenderScale} from '@/Pixi/renderer/RendererUtils'
import Core from '@/Pixi/Core'
import {INSPECTED_CARD_WINDOW_FRACTION} from '@/Pixi/renderer/InspectedCardRenderer'
import CardType from '@shared/enums/CardType'

const setup = () => {
	const inspectedCard = computed(() => store.getters.gameStateModule.inspectedCard)
	const superSamplingLevel = computed(() => getRenderScale().superSamplingLevel)

	const buffs = computed(() => {
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
		superSamplingLevel,
		inspectedCard,
		CardType: CardType
	}
}

export default {
	setup: setup,
	computed: {
		positionStyle() {
			return {
				top: `calc(50% - ${this.cardHeight / 2 / this.superSamplingLevel}px`,
				left: `calc(50% + ${this.cardWidth / 2 / this.superSamplingLevel}px`,
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
		margin: 4px;
		padding: 8px 16px;
		background: rgba(#000000, 0.6);
		width: 500px;
		border-radius: 10px;
		font-size: 20px;

		.card-base-stats {
			text-align: start;
			.stats-line {
				display: flex;
				flex-direction: row;
				& > * {
					flex: 1;
				}
				padding: 4px 0;
			}
		}

		.card-buffs {
			text-align: start;
			.buff-line {
				margin: 4px 0;
			}

			.buff-name {
				font-weight: bold;
			}
		}

		.menu-separator {
			width: 100%;
			height: 1px;
			background: white;
			margin: 8px 0;
		}
	}
</style>
