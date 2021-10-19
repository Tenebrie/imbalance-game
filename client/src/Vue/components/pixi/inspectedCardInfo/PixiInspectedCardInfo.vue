<template>
	<div class="pixi-inspected-card-info-overlay" v-if="overlayDisplayed" ref="overlayRef" @click="onOverlayClick" @mouseup="onOverlayClick">
		<div class="card-info-section card-base-stats" v-if="displayInGameStats">
			<div v-if="inspectedCard.type === CardType.UNIT" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.power') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ inspectedCard.stats.basePower }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ inspectedCard.stats.power }}</b> |
				<span>{{ $locale.get('card.inspect.stat.maximum') }}: </span>
				<b>{{ inspectedCard.stats.maxPower }}</b>
			</div>
			<div v-if="inspectedCard.type === CardType.UNIT && displayArmor" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.armor') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ inspectedCard.stats.baseArmor }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ inspectedCard.stats.armor }}</b> |
				<span>{{ $locale.get('card.inspect.stat.maximum') }}: </span>
				<b>{{ inspectedCard.stats.maxArmor }}</b>
			</div>
			<div v-if="displayManacost" class="stats-line">
				<div class="header">{{ $locale.get('card.inspect.manacost') }}:</div>
				<span>{{ $locale.get('card.inspect.stat.base') }}: </span>
				<b>{{ inspectedCard.stats.baseSpellCost }}</b> |
				<span>{{ $locale.get('card.inspect.stat.current') }}: </span>
				<b>{{ inspectedCard.stats.spellCost }}</b>
			</div>
		</div>
		<div class="card-info-section" v-if="displayedFeatures.length > 0">
			<div class="menu-separator" v-if="displayInGameStats" />
			<div class="header">{{ $locale.get('card.inspect.keywords') }}:</div>
			<div class="line" v-for="feature in displayedFeatures" :key="feature">
				<span class="object-name"> {{ $locale.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`) }}: </span>
				<span>
					{{ $locale.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.description`) }}
				</span>
			</div>
		</div>
		<div v-if="displayBuffs">
			<div class="menu-separator" v-if="displayedFeatures.length > 0 || displayInGameStats" />
			<InspectedCardBuffs :card="inspectedCard" />
		</div>
		<div class="card-info-section" v-if="displayedRelatedCards.length > 0">
			<div class="menu-separator" v-if="displayInGameStats || displayedFeatures.length > 0 || displayBuffs" />
			<div class="header" v-if="displayLeaderPowersLabel">{{ $locale.get('card.inspect.leaderPowers') }}:</div>
			<div class="card-section">
				<div class="related-card" v-for="relatedCardClass in displayedRelatedCards" :key="relatedCardClass">
					<pixi-related-card :card-class="relatedCardClass" />
				</div>
			</div>
		</div>
		<div class="card-info-section flavor-section" v-if="flavorTextLines.length > 0">
			<div
				class="menu-separator"
				v-if="displayInGameStats || displayedFeatures.length > 0 || inspectedCard.relatedCards.length > 0 || displayBuffs"
			/>
			<div v-for="textLine in flavorTextLines" :key="textLine">
				{{ textLine }}
			</div>
		</div>
		<div class="card-info-section workshop-section" v-if="!isInGame">
			<div
				class="menu-separator"
				v-if="
					displayInGameStats ||
					displayedFeatures.length > 0 ||
					inspectedCard.relatedCards.length > 0 ||
					displayBuffs ||
					flavorTextLines.length > 0
				"
			/>
			<a :href="`/workshop?from=${inspectedCard.class.toLowerCase()}`" target="_blank">Open in Workshop</a>
		</div>
	</div>
</template>

<script lang="ts">
import BuffFeature from '@shared/enums/BuffFeature'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import * as PIXI from 'pixi.js'
import { computed, defineComponent, ref } from 'vue'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import Localization from '@/Pixi/Localization'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import { snakeToCamelCase } from '@/utils/Utils'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'
import InspectedCardBuffs from '@/Vue/components/pixi/inspectedCardInfo/InspectedCardBuffList.vue'
import PixiRelatedCard from '@/Vue/components/pixi/PixiRelatedCard.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		InspectedCardBuffs,
		PixiRelatedCard,
	},

	setup() {
		const routeQuery = useDecksRouteQuery()
		const isInGame = computed<boolean>(() => store.getters.gameStateModule.isInGame)
		const displayExperimentalCards = computed<boolean>(() => !isInGame.value && routeQuery.value.experimental)

		const inspectedCard = computed<CardMessage | RenderedCard>(() => {
			const cardInGame = Core.game ? Core.game.findRenderedCardById(store.getters.inspectedCard.card!.id) : null
			return (isInGame.value && cardInGame) || (store.getters.inspectedCard.card as CardMessage | RenderedCard)
		})

		const displayArmor = computed<boolean>(() => {
			return inspectedCard.value.stats.armor > 0 || inspectedCard.value.stats.maxArmor > 0 || inspectedCard.value.stats.baseArmor > 0
		})

		const displayManacost = computed<boolean>(() => {
			return (
				inspectedCard.value.type === CardType.SPELL ||
				inspectedCard.value.stats.baseSpellCost > 0 ||
				inspectedCard.value.stats.spellCost > 0
			)
		})

		const displayedFeatures = computed<CardFeature[]>(() => {
			let features = inspectedCard.value instanceof RenderedCard ? inspectedCard.value.features : inspectedCard.value.baseFeatures
			if (!(inspectedCard.value instanceof RenderedCard)) {
				inspectedCard.value.buffs.buffs.forEach((buff) => {
					features = features.concat(buff.cardFeatures)
				})
			}
			features = [...new Set(features)]
			return features.filter((feature) => Localization.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`, 'null'))
		})

		const displayedRelatedCards = computed<string[]>(() => {
			return new Array(...new Set(inspectedCard.value.relatedCards)).filter((cardClass) => {
				const populatedCard = store.state.editor.cardLibrary.find((card) => card.class === cardClass)
				return !populatedCard?.isExperimental || inspectedCard.value.isExperimental || displayExperimentalCards.value
			})
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

		const displayInGameStats = computed<boolean>(() => {
			return (
				isInGame.value &&
				inspectedCard.value &&
				inspectedCard.value instanceof RenderedCard &&
				inspectedCard.value.color !== CardColor.LEADER
			)
		})

		const displayBuffs = computed<boolean>(() => {
			const buffs = inspectedCard.value.buffs.buffs as (ClientBuff | BuffMessage)[]
			return buffs.some((buff) => !buff.buffFeatures.includes(BuffFeature.INVISIBLE))
		})

		const overlayDisplayed = computed<boolean>(() => {
			return inspectedCard.value && !inspectedCard.value.isHidden
		})

		const onOverlayClick = (event: MouseEvent) => {
			event.cancelBubble = true
			if (!event.ctrlKey && !(event.target instanceof HTMLAnchorElement)) {
				event.preventDefault()
			}
		}

		const flavorTextLines = computed<string[]>(() => {
			const value = Localization.getCardFlavor(inspectedCard.value)
			if (value === null) {
				return []
			}
			return value.split('\n')
		})

		return {
			isInGame,
			overlayRef,
			displayArmor,
			displayManacost,
			inspectedCard,
			editorModeOffset,
			overlayDisplayed,
			displayBuffs,
			displayInGameStats,
			displayedFeatures,
			displayedRelatedCards,
			displayLeaderPowersLabel,
			onOverlayClick,
			flavorTextLines,
			CardType: CardType,
			CardFeature: CardFeature,
			snakeToCamelCase: snakeToCamelCase,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.pixi-inspected-card-info-overlay {
	position: absolute;
	z-index: 10;
	background: black;
	padding: 8px 16px;
	background: rgba(#000000, 0.5);
	backdrop-filter: blur(4px);
	border-radius: 10px;
	font-size: 20px;
	margin-top: 4px;
	pointer-events: auto;
	color: lightgray;
	overflow-y: auto;
	max-height: calc(100% - 22px);

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

			.related-card {
				position: relative;
				flex-grow: 0;
				flex-shrink: 0;
				width: calc(#{$CARD_WIDTH} / 2);
				height: calc(#{$CARD_HEIGHT} / 2);
			}
		}

		&.flavor-section {
			color: gray;
			font-style: italic;
		}

		.object-name {
			font-weight: bold;
		}
	}

	.menu-separator {
		width: 100%;
		height: 1px;
		background: rgba(white, 0.5);
		margin: 8px 0;
	}
}
</style>
