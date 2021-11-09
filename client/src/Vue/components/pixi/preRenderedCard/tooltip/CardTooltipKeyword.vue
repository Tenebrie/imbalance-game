<template>
	<div>
		<b>{{ Localization.get(`${localizationKey}`) }}:</b><br />{{ Localization.get(`${localizationKey}.description`) }}
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

import Localization from '@/Pixi/Localization'

export type CardTooltipKeywordProps = {
	keyword: string
}

export default defineComponent({
	props: {
		keyword: {
			type: String as PropType<string>,
			required: true,
		},
	},

	setup(props) {
		const localizationKey = computed<string>(() => {
			return `card.keyword.${props.keyword}`
		})

		return {
			localizationKey,
			Localization: Localization,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';
</style>
