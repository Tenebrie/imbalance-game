<template>
	<div class="pixi-inspected-card-overlay" v-if="this.inspectedCard" :style="positionStyle">
		<div class="card-info-section">
			<div v-if="this.inspectedCard.type === CardType.UNIT" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.power') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ this.inspectedCard.basePower }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ this.inspectedCard.power }}</b> |
				<span>{{ $locale.get('card.inspect.stat.maximum') }}: </span>
				<b>{{ this.inspectedCard.maxPower }}</b>
			</div>
			<div v-if="this.inspectedCard.type === CardType.UNIT && this.displayArmor" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.armor') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ this.inspectedCard.baseArmor }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ this.inspectedCard.armor }}</b> |
				<span>{{ $locale.get('card.inspect.stat.maximum') }}: </span>
				<b>{{ this.inspectedCard.maxArmor }}</b>
			</div>
			<div v-if="this.inspectedCard.type === CardType.SPELL" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.manacost') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ this.inspectedCard.basePower }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ this.inspectedCard.power }}</b>
			</div>
		</div>
		<div class="menu-separator" />
		<div class="card-info-section" v-if="this.displayedFeatures.length > 0">
			<div class="header">{{ $locale.get('card.inspect.keywords') }}:</div>
			<div class="line" v-for="feature in this.displayedFeatures" :key="feature">
				<span class="object-name">
					{{ $locale.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`) }}:
				</span>
				<span>
					{{ $locale.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.description`) }}
				</span>
			</div>
		</div>
		<div class="menu-separator" v-if="this.inspectedCard.buffs.buffs.length > 0 && this.displayedFeatures.length > 0" />
		<div class="card-info-section" v-if="this.inspectedCard.buffs.buffs.length > 0">
			<div class="header">{{ $locale.get('card.inspect.buffs') }}:</div>
			<div class="line" v-for="buff in this.inspectedCard.buffs.buffs" :key="buff.id">
				<span v-if="buff.intensity > 1">{{ buff.intensity }} x </span>
				<span class="object-name">{{ $locale.get(buff.name) }}: </span>
				<span>{{ $locale.get(buff.description) }}</span>
				<span v-if="buff.duration !== Infinity">
					({{ $locale.get('card.inspect.buffs.turnsRemaining') }}: {{ Math.ceil(buff.duration / 2) }})
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import {computed} from '@vue/composition-api'
import {CARD_ASPECT_RATIO, getRenderScale} from '@/Pixi/renderer/RendererUtils'
import Core from '@/Pixi/Core'
import {INSPECTED_CARD_WINDOW_FRACTION} from '@/Pixi/renderer/InspectedCardRenderer'
import CardType from '@shared/enums/CardType'
import {snakeToCamelCase} from '@/utils/Utils'
import CardFeature from '@shared/enums/CardFeature'
import Localization from '@/Pixi/Localization'

const setup = () => {
	const inspectedCard = computed(() => store.getters.gameStateModule.inspectedCard)
	const superSamplingLevel = computed(() => getRenderScale().superSamplingLevel)

	const cardHeight = computed(() => {
		return Core.renderer.pixi.view.height * INSPECTED_CARD_WINDOW_FRACTION
	})
	const cardWidth = computed(() => {
		return cardHeight.value * CARD_ASPECT_RATIO
	})

	const displayArmor = computed(() => {
		return inspectedCard.value.armor > 0 || inspectedCard.value.maxArmor > 0 || inspectedCard.value.baseArmor > 0
	})

	const displayedFeatures = computed(() => {
		return inspectedCard.value.features.filter(feature => Localization.getValueOrNull(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`))
	})

	return {
		cardWidth,
		cardHeight,
		displayArmor,
		displayedFeatures,
		superSamplingLevel,
		inspectedCard,
		CardType: CardType,
		CardFeature: CardFeature,
		snakeToCamelCase: snakeToCamelCase
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

	$WINDOW_WIDTH: 512px;

	.pixi-inspected-card-overlay {
		position: absolute;
		background: black;
		margin: 4px;
		padding: 8px 16px;
		background: rgba(#000000, 0.6);
		border-radius: 10px;
		font-size: 20px;

		.card-base-stats {
			text-align: start;
			.stats-line {
				display: flex;
				flex-direction: row;
				& > * {
					display: inline-block;
					flex: 1;
				}
				padding: 4px 0;
			}
		}

		.card-info-section {
			text-align: start;
			max-width: $WINDOW_WIDTH;

			.header {
				margin: 8px 0;
				font-weight: bold;
				font-size: 1.2em;
			}

			.line {
				margin: 4px 0;
			}

			.object-name {
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
