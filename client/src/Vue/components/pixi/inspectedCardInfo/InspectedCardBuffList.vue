<template>
	<div class="card-info-section" v-if="displayedBuffs.length > 0">
		<div class="header">{{ $locale.get('card.inspect.buffs') }}:</div>
		<InspectedCardBuffListItem v-for="buff in displayedBuffs" :key="buff.buff.id" :buff="buff" />
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/card/CardMessage'
import ClientBuff from '@/Pixi/models/ClientBuff'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import BuffFeature from '@shared/enums/BuffFeature'
import InspectedCardBuffListItem from '@/Vue/components/pixi/inspectedCardInfo/InspectedCardBuffListItem.vue'

interface Props {
	card: RenderedCard | CardMessage
}

export interface BuffWrapper {
	buff: ClientBuff | BuffMessage
	intensity: number
}

export default defineComponent({
	props: {
		card: Object as PropType<RenderedCard | CardMessage>,
	},

	components: {
		InspectedCardBuffListItem,
	},

	setup(props: Props) {
		const visibleBuffs = computed<BuffWrapper[]>(() => {
			const originalBuffs = props.card.buffs.buffs as (ClientBuff | BuffMessage)[]
			return originalBuffs
				.filter((buff) => !buff.buffFeatures.includes(BuffFeature.SERVICE_BUFF))
				.map((buff) => ({
					buff,
					intensity: 1,
				}))
		})

		const displayedBuffs = computed<BuffWrapper[]>(() => {
			if (visibleBuffs.value.length === 0) {
				return []
			}

			let stackedBuffs: BuffWrapper[] = [visibleBuffs.value[0]]

			visibleBuffs.value.slice(1).forEach((currentBuff) => {
				const previousBuff = stackedBuffs[stackedBuffs.length - 1]
				if (
					currentBuff.buff.class === previousBuff.buff.class &&
					(currentBuff.buff.duration === Infinity || currentBuff.buff.duration === previousBuff.buff.duration) &&
					currentBuff.buff.protected === previousBuff.buff.protected
				) {
					previousBuff.intensity += 1
					return
				}
				stackedBuffs.push(currentBuff)
			})

			return stackedBuffs
		})

		return {
			displayedBuffs,
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
	background: rgba(#000000, 0.8);
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
	}

	.menu-separator {
		width: 100%;
		height: 1px;
		background: rgba(white, 0.5);
		margin: 8px 0;
	}
}
</style>
