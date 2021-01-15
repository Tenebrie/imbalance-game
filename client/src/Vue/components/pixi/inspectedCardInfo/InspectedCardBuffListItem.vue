<template>
	<div class="list-item" :class="style">
		<span v-if="!buff.buff.protected">* </span>
		<span v-if="buff.intensity > 1">{{ buff.intensity }}x </span>
		<span class="object-name">{{ $locale.get(buff.buff.name) }}: </span>
		<span>{{ $locale.get(buff.buff.description) }}</span>
		<span v-if="buff.buff.duration !== Infinity"> ({{ $locale.get('card.inspect.buffs.turnsRemaining') }}: {{ buff.buff.duration }}) </span>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api'
import { BuffWrapper } from '@/Vue/components/pixi/inspectedCardInfo/InspectedCardBuffList.vue'
import BuffAlignment from '@shared/enums/BuffAlignment'

interface Props {
	buff: BuffWrapper
}

export default defineComponent({
	props: {
		buff: Object as PropType<BuffWrapper>,
	},

	setup(props: Props) {
		const style = computed<Record<string, boolean>>(() => ({
			positive: props.buff.buff.alignment === BuffAlignment.POSITIVE,
			neutral: props.buff.buff.alignment === BuffAlignment.NEUTRAL,
			negative: props.buff.buff.alignment === BuffAlignment.NEGATIVE,
		}))

		return {
			style,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.list-item {
	margin: 8px 0;
}
.object-name {
	font-weight: bold;
}

.positive {
	color: lightgreen;
}
.neutral {
	color: lightgoldenrodyellow;
}
.negative {
	color: palevioletred;
}
</style>
