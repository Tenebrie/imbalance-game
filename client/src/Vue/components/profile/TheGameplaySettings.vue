<template>
	<div class="the-gameplay-settings">
		<div class="element">
			<h4 class="header">Fast mode</h4>
			<h4 class="value">{{ fastModeValue }}</h4>
			<div class="toggle-container">
				<toggle class="toggle" v-model="fastMode" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'

import Toggle from '@/Vue/components/utils/Toggle.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { Toggle },
	setup() {
		const fastMode = computed<boolean>({
			get() {
				return store.state.userPreferencesModule.fastMode
			},
			set(value) {
				store.commit.userPreferencesModule.setFastMode(value)
			},
		})

		const fastModeValue = computed<string>(() => {
			return fastMode.value ? 'Enabled' : 'Disabled'
		})

		watch(
			() => [fastMode.value],
			() => {
				store.dispatch.userPreferencesModule.savePreferences()
			}
		)

		return {
			fastMode,
			fastModeValue,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-gameplay-settings {
	width: 100%;
	text-align: start;
	padding-top: 12px;

	h4 {
		margin: 0;
	}

	.toggle {
		max-width: 64px;
	}

	.element {
		width: 100%;
		display: flex;
		justify-content: space-between;

		.header {
			flex-shrink: 1;
		}

		.value {
			text-align: end;
			flex-grow: 1;
			margin-right: 4px;
		}

		.toggle-container {
			flex-grow: 0;
			flex-shrink: 0;
			width: 40%;
		}
	}
}
</style>
