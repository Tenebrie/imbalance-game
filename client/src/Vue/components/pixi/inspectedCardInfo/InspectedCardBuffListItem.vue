<template>
	<div class="list-item" :class="style">
		<span v-if="!buff.buff.protected">* </span>
		<span v-if="buff.intensity > 1">{{ buff.intensity }}x </span>
		<span class="object-name">{{ $locale.getBuffName(buff.buff) }}: </span>
		<span>{{ $locale.getBuffDescription(buff.buff) }}</span>
		<span v-if="buff.buff.duration !== Infinity"> ({{ $locale.get('card.inspect.buffs.turnsRemaining') }}: {{ buff.buff.duration }}) </span>
	</div>
</template>

<script lang="ts">
import BuffAlignment from '@shared/enums/BuffAlignment'
import { computed, defineComponent, PropType } from 'vue'

import { BuffWrapper } from '@/Vue/components/pixi/inspectedCardInfo/InspectedCardBuffList.vue'

export default defineComponent({
	props: {
		buff: {
			type: Object as PropType<BuffWrapper>,
			required: true,
		},
	},

	setup(props) {
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
