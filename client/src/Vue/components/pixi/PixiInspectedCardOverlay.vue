<template>
	<div class="pixi-inspected-card-overlay" v-if="this.overlayDisplayed" :style="positionStyle" ref="overlayRef">
		<div class="card-info-section card-base-stats" v-if="this.isInGame">
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
				<b>{{ this.inspectedCard.spellCost }}</b>
			</div>
		</div>
		<div class="card-info-section" v-if="this.displayedFeatures.length > 0">
			<div class="menu-separator" v-if="this.isInGame" />
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
		<div class="card-info-section" v-if="this.inspectedCard.buffs.buffs.length > 0">
			<div class="menu-separator" />
			<div class="header">{{ $locale.get('card.inspect.buffs') }}:</div>
			<div class="line" v-for="buff in this.inspectedCard.buffs.buffs" :key="buff.id">
				<span v-if="buff.intensity > 1">{{ buff.intensity }} x </span>
				<span class="object-name">{{ $locale.get(buff.name) }}: </span>
				<span>{{ $locale.get(buff.description) }}</span>
				<span v-if="buff.duration !== Infinity">
					({{ $locale.get('card.inspect.buffs.turnsRemaining') }}: {{ buff.duration }})
				</span>
			</div>
		</div>
		<div class="card-info-section" v-if="this.inspectedCard.baseRelatedCards.length > 0">
			<div class="menu-separator" v-if="this.isInGame || this.displayedFeatures.length > 0" />
			<div class="header" v-if="this.displayLeaderPowersLabel">
				{{ $locale.get('card.inspect.leaderPowers') }}:
			</div>
			<div class="card-section">
				<div class="related-card" v-for="relatedCardClass in this.inspectedCard.baseRelatedCards" :key="relatedCardClass">
					<pixi-related-card :card-class="relatedCardClass" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import * as PIXI from 'pixi.js'
import store from '@/Vue/store'
import {computed, ref} from '@vue/composition-api'
import {CARD_ASPECT_RATIO, CARD_HEIGHT, getRenderScale} from '@/Pixi/renderer/RendererUtils'
import Core from '@/Pixi/Core'
import {INSPECTED_CARD_WINDOW_FRACTION} from '@/Pixi/renderer/InspectedCardRenderer'
import CardType from '@shared/enums/CardType'
import {snakeToCamelCase} from '@/utils/Utils'
import CardFeature from '@shared/enums/CardFeature'
import Localization from '@/Pixi/Localization'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Card from '@shared/models/Card'
import PixiRelatedCard from '@/Vue/components/pixi/PixiRelatedCard.vue'
import CardColor from '@shared/enums/CardColor'

const setup = () => {
	const isInGame = computed<boolean>(() => store.getters.gameStateModule.isInGame)
	const inspectedCard = computed<Card>(() => {
		return (isInGame && store.getters.gameStateModule.inspectedCard) || store.getters.editor.inspectedCard.card
	})
	const superSamplingLevel = computed<number>(() => getRenderScale().superSamplingLevel)

	const cardHeight = computed<number>(() => {
		return Core.renderer ? Core.renderer.pixi.view.height * INSPECTED_CARD_WINDOW_FRACTION : CARD_HEIGHT / 2
	})
	const cardWidth = computed<number>(() => {
		return cardHeight.value * CARD_ASPECT_RATIO
	})

	const displayArmor = computed<boolean>(() => {
		return inspectedCard.value.armor > 0 || inspectedCard.value.maxArmor > 0 || inspectedCard.value.baseArmor > 0
	})

	const displayedFeatures = computed<CardFeature[]>(() => {
		const features = inspectedCard.value instanceof RenderedCard ? inspectedCard.value.features : inspectedCard.value.baseFeatures
		return features.filter(feature => Localization.getValueOrNull(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`))
	})

	const overlayRef = ref<HTMLDivElement>()
	const editorModeOffset = computed<PIXI.Point>(() => {
		const offset = new PIXI.Point(0, 0)
		if (overlayRef.value) {
			const boundingBox = overlayRef.value.getBoundingClientRect()
			offset.set(Math.min(0, window.innerWidth - boundingBox.right), Math.min(window.innerHeight - boundingBox.bottom, 0))
		}
		return offset
	})

	const displayLeaderPowersLabel = computed<boolean>(() => {
		return inspectedCard.value && inspectedCard.value.color === CardColor.LEADER
	})

	const overlayDisplayed = computed<boolean>(() => {
		return inspectedCard.value &&
			inspectedCard.value.type !== CardType.HIDDEN &&
			(isInGame.value || displayedFeatures.value.length > 0 || inspectedCard.value.baseRelatedCards.length > 0)
	})

	return {
		isInGame,
		cardWidth,
		cardHeight,
		overlayRef,
		displayArmor,
		inspectedCard,
		editorModeOffset,
		overlayDisplayed,
		displayedFeatures,
		superSamplingLevel,
		displayLeaderPowersLabel,
		CardType: CardType,
		CardFeature: CardFeature,
		snakeToCamelCase: snakeToCamelCase,
	}
}

export default {
	setup: setup,
	components: {
		PixiRelatedCard
	},
	computed: {
		positionStyle() {
			if (this.isInGame) {
				return {
					top: `calc(50% - ${this.cardHeight / 2 / this.superSamplingLevel}px`,
					left: `calc(50% + ${this.cardWidth / 2 / this.superSamplingLevel}px`,
				}
			} else {
				return {
					top: `calc(${this.editorModeOffset.y}px - 50px)`,
					left: `calc(${this.editorModeOffset.x}px - 40px)`,
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.pixi-inspected-card-overlay {
		position: absolute;
		z-index: 10;
		background: black;
		padding: 8px 16px;
		background: rgba(#000000, 0.8);
		border-radius: 10px;
		font-size: 20px;
		margin-top: 4px;

		.card-base-stats {
			padding-bottom: 8px;
		}

		.card-info-section {
			text-align: start;
			max-width: $INSPECTED-CARD-INFO-WINDOW-WIDTH;

			.header {
				margin: 8px 0;
				font-weight: bold;
				font-size: 1.2em;
			}

			.line {
				margin: 8px 0;
			}

			.card-section {
				display: flex;
				flex-direction: row;
				max-width: 100%;
				width: fit-content;
				flex-wrap: wrap;
				justify-content: center;

				.related-card {
					position: relative;
					flex-grow: 0;
					flex-shrink: 0;
					width: calc(#{$CARD_WIDTH} / 2);
					height: calc(#{$CARD_HEIGHT} / 2);
				}
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
