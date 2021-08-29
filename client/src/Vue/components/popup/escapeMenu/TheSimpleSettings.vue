<template>
	<div class="the-simple-settings">
		<div class="the-simple-settings-container" @click="onMenuClick">
			<the-gameplay-settings class="gameplay-settings" />
			<div class="menu-separator" />
			<the-volume-settings />
			<div class="info">More settings available in the user profile menu when not in game.</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheGameplaySettings from '@/Vue/components/profile/TheGameplaySettings.vue'
import TheVolumeSettings from '@/Vue/components/profile/TheVolumeSettings.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { TheGameplaySettings, TheVolumeSettings },

	setup() {
		const onMenuClick = (event: MouseEvent): void => {
			event.cancelBubble = true
		}

		const onConfirm = (): void => {
			store.dispatch.popupModule.close()
		}

		return {
			onMenuClick,
			onConfirm,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-simple-settings {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.the-simple-settings-container {
		width: 100%;
		text-align: start;
		border-radius: 16px;
		padding: 0 32px;
		overflow-y: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.info {
		width: 100%;
		margin-top: 16px;
		text-align: start;
		color: darkgrey;

		.header {
			font-weight: bold;
		}
	}

	.gameplay-settings {
		margin-bottom: 12px;
	}

	.button-container {
		width: 100%;
	}

	.menu-separator {
		width: 100%;
		height: 1px;
		margin: 8px 0;
		background: rgba(white, 0.7);
	}
}
</style>
