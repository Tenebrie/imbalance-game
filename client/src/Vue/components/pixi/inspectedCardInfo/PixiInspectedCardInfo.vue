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
			<div class="links">
				<div>
					<a :href="`/workshop?from=${inspectedCard.class.toLowerCase()}`" target="_blank">Open in Workshop</a>
				</div>
				<div v-if="adminLinkVisible" class="menu-separator-horizontal" />
				<a v-if="adminLinkVisible" :href="`/admin/cards/${inspectedCard.class.toLowerCase()}`">Open in Admin panel</a>
			</div>
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

import Localization from '@/Pixi/Localization'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import { snakeToCamelCase } from '@/utils/Utils'
import { useDecksRouteQuery } from '@/Vue/components/editor/EditorRouteQuery'
import InspectedCardBuffs from '@/Vue/components/pixi/inspectedCardInfo/InspectedCardBuffList.vue'
import PixiRelatedCard from '@/Vue/components/pixi/PixiRelatedCard.vue'
import store from '@/Vue/store'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export default defineComponent({
	components: {
		InspectedCardBuffs,
		PixiRelatedCard,
	},

	setup() {
		const routeQuery = useDecksRouteQuery()
		const isInGame = computed<boolean>(() => store.getters.gameStateModule.isInGame)
		const displayExperimentalCards = computed<boolean>(() => !isInGame.value && routeQuery.value.experimental)

		const inspectedCard = computed<CardMessage | null>(() => {
			return InspectedCardStore.getters.card || InspectedCardStore.getters.lastCard
		})

		const displayArmor = computed<boolean>(() => {
			const card = inspectedCard.value
			if (!card) {
				return false
			}
			return card.stats.armor > 0 || card.stats.maxArmor > 0 || card.stats.baseArmor > 0
		})

		const displayManacost = computed<boolean>(() => {
			const card = inspectedCard.value
			if (!card) {
				return false
			}
			return card.type === CardType.SPELL || card.stats.baseSpellCost > 0 || card.stats.spellCost > 0
		})

		const displayedFeatures = computed<CardFeature[]>(() => {
			const card = inspectedCard.value
			if (!card) {
				return []
			}

			let features = card.baseFeatures
			card.buffs.buffs.forEach((buff) => {
				features = features.concat(buff.cardFeatures)
			})
			features = [...new Set(features)]
			return features.filter((feature) => Localization.get(`card.feature.${snakeToCamelCase(CardFeature[feature])}.name`, 'null'))
		})

		const displayedRelatedCards = computed<string[]>(() => {
			const card = inspectedCard.value
			if (!card) {
				return []
			}
			return new Array(...new Set(card.relatedCards)).filter((cardClass) => {
				const populatedCard = store.state.editor.cardLibrary.find((card) => card.class === cardClass)
				return !populatedCard?.isExperimental || card.isExperimental || displayExperimentalCards.value
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
			const card = inspectedCard.value
			if (!card) {
				return false
			}
			return card && card.color === CardColor.LEADER
		})

		const displayInGameStats = computed<boolean>(() => {
			return (
				isInGame.value &&
				!!inspectedCard.value &&
				// inspectedCard.value instanceof RenderedCard &&
				inspectedCard.value.color !== CardColor.LEADER
			)
		})

		const displayBuffs = computed<boolean>(() => {
			const card = inspectedCard.value
			if (!card) {
				return false
			}
			const buffs = card.buffs.buffs as (ClientBuff | BuffMessage)[]
			return buffs.some((buff) => !buff.buffFeatures.includes(BuffFeature.INVISIBLE))
		})

		const overlayDisplayed = computed<boolean>(() => {
			const value = inspectedCard.value
			return !!value && !value.isHidden
		})

		const onOverlayClick = (event: MouseEvent) => {
			event.cancelBubble = true
			if (!event.ctrlKey && !(event.target instanceof HTMLAnchorElement)) {
				event.preventDefault()
			}
		}

		const flavorTextLines = computed<string[]>(() => {
			const card = inspectedCard.value
			if (!card) {
				return []
			}
			const value = Localization.getCardFlavor(card)
			if (value === null) {
				return []
			}
			return value.split('\n')
		})

		const adminLinkVisible = process.env.NODE_ENV === 'development'

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
			adminLinkVisible,
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
	padding: 8px 16px;
	background: rgba(black, 0.5);
	border-radius: 10px;
	font-size: 20px;
	margin-top: 4px;
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
			// color: lighten($COLOR_PRIMARY, 30);
			// text-align: center;
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

		&.workshop-section > .links {
			display: flex;
			gap: 16px;
		}

		.object-name {
			font-weight: bold;
			color: $COLOR_SECONDARY;
		}
	}

	.menu-separator {
		width: 100%;
		height: 1px;
		background: rgba(white, 0.5);
		margin: 8px 0;
	}

	.menu-separator-horizontal {
		width: 1px;
		background: rgba(white, 0.5);
	}
}
</style>
