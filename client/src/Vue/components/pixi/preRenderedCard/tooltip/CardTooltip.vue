<template>
	<div class="tooltip" :class="rootClass" :style="rootStyle" v-if="parsedTooltip" @click="onClick">
		<div class="hitbox" :style="{ width: tooltip.size.x + 'px', height: tooltip.size.y + 'px' }"></div>
		<div class="text" :style="{ left: tooltip.size.x / 2 + 'px' }">
			<!--			<div class="content">{{ displayedElement }}</div>-->
			<div class="content">
				<component :is="parsedTooltip?.component" v-bind="parsedTooltip?.props"></component>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'
import { RichTextTooltip } from '@/Pixi/render/RichText'
import { snakeToCamelCase } from '@/utils/Utils'
import CardTooltipKeyword, { CardTooltipKeywordProps } from '@/Vue/components/pixi/preRenderedCard/tooltip/CardTooltipKeyword.vue'
import CardTooltipRelatedCard, {
	CardTooltipRelatedCardProps,
} from '@/Vue/components/pixi/preRenderedCard/tooltip/CardTooltipRelatedCard.vue'
import store from '@/Vue/store'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

type ParsedTooltip =
	| {
			type: 'card'
			component: typeof CardTooltipRelatedCard
			props: CardTooltipRelatedCardProps
	  }
	| {
			type: 'keyword'
			component: typeof CardTooltipKeyword
			props: CardTooltipKeywordProps
	  }

export default defineComponent({
	props: {
		card: {
			type: Object as PropType<CardMessage>,
			required: true,
		},
		tooltip: {
			type: Object as PropType<RichTextTooltip>,
			required: true,
		},
	},

	setup(props) {
		const parsedTooltip = computed<ParsedTooltip | null>(() => {
			const baseText = props.tooltip.text
			const sanitizedText = snakeToCamelCase(baseText.trim().replace(/[:,]/g, '').replace(/\s/g, '_'))
			if (baseText.includes('Void')) {
				console.log(sanitizedText)

				console.log('a')
				const card = store.state.editor.cardLibrary.find((c) => c.class === 'unitVoidPortal')!
				console.log('b')
				const cardName = snakeToCamelCase(Localization.getCardName(card).replace(/[sS]/g, '').replace(/\s/g, '_'))
				console.log('c')
				const cardTitle = snakeToCamelCase((Localization.getCardTitle(card) || '').replace(/\s/g, '_'))
				const fullName = snakeToCamelCase(`${cardName}_${cardTitle}`)
				console.log(fullName)
			}

			const matchingCard = store.state.editor.cardLibrary.find((card) => {
				const sanitizedCardText = snakeToCamelCase(sanitizedText.replace(/[sS]/g, ''))
				const cardName = snakeToCamelCase(Localization.getCardName(card).replace(/[sS]/g, '').replace(/\s/g, '_'))
				const cardTitle = snakeToCamelCase((Localization.getCardTitle(card) || '').replace(/\s/g, '_'))
				const fullName = cardTitle ? snakeToCamelCase(`${cardName}_${cardTitle}`) : cardName
				return sanitizedCardText.toLowerCase() === fullName.toLowerCase()
			})
			if (matchingCard) {
				return {
					type: 'card',
					component: CardTooltipRelatedCard,
					props: {
						card: matchingCard,
					},
				}
			}

			const localizationKey = `card.keyword.${sanitizedText}`
			if (Localization.get(`${localizationKey}`, 'null') !== null) {
				return {
					type: 'keyword',
					component: CardTooltipKeyword,
					props: {
						keyword: sanitizedText,
					},
				}
			}

			return null
		})

		const isClickable = computed<boolean>(() => {
			const tooltip = parsedTooltip.value
			if (!tooltip) {
				return false
			}
			const isInGame = store.getters.gameStateModule.isInGame
			return tooltip.type === 'card' || !isInGame
		})

		const onClick = (event: MouseEvent) => {
			const tooltip = parsedTooltip.value
			if (!isClickable.value || !tooltip) {
				return
			}

			const isInGame = store.getters.gameStateModule.isInGame
			if (tooltip.type === 'card' && (event.ctrlKey || isInGame)) {
				InspectedCardStore.dispatch.setCard({
					message: tooltip.props.card,
				})
				event.preventDefault()
				event.stopPropagation()
			} else if (tooltip.type === 'card' && !event.ctrlKey && !isInGame) {
				const query = Localization.getCardName(tooltip.props.card)
				store.commit.editor.setSearchQuery(query)
				InspectedCardStore.dispatch.clear()
			} else if (tooltip.type === 'keyword' && !isInGame) {
				const localizationKey = `card.keyword.${tooltip.props.keyword}`
				const query = Localization.get(localizationKey, 'empty').replace(/\(X\)|:/g, '')
				store.commit.editor.setSearchQuery(query)
				InspectedCardStore.dispatch.clear()
			}
		}

		const rootClass = computed<Record<string, any>>(() => ({
			visible: parsedTooltip.value !== null,
			clickable: isClickable.value,
			background: parsedTooltip.value?.type === 'keyword',
		}))

		const rootStyle = computed<Record<string, any>>(() => ({
			left: props.tooltip.position.x + 'px',
			bottom: -props.tooltip.position.y + 51 + 'px',
		}))

		return {
			onClick,
			rootClass,
			rootStyle,
			parsedTooltip,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
.tooltip {
	display: none;
	position: absolute;

	&.visible {
		display: block;
	}

	&.clickable {
		cursor: pointer;
	}

	&.background > .text > .content {
		background: $COLOR_BACKGROUND-TRANSPARENT;
		backdrop-filter: blur(16px);
	}

	&:hover > .text > .content {
		opacity: 1;
		transition: opacity 0s;
	}

	.hitbox {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		opacity: 0;
		background: $COLOR_BACKGROUND-TRANSPARENT;
		border-radius: 4px;
		user-select: none;
		padding: 2px 4px;
		margin-left: -4px;
		margin-top: -2px;
	}

	.text {
		$text-width: 350px;
		position: absolute;
		bottom: 8px;
		margin-left: calc(-#{$text-width} / 2);
		width: $text-width;
		pointer-events: none;
		margin-top: -1em;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;

		.content {
			padding: 4px 8px;
			margin: -4px -8px;
			opacity: 0;
			transition: opacity 0.3s;
			border-radius: 8px;
		}
	}
}
</style>
