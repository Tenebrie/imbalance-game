<template>
	<div class="the-simple-settings">
		<div class="the-simple-settings-container" @click="onMenuClick">
			<the-volume-settings />
		</div>
	</div>
</template>

<script lang="ts">
import TheVolumeSettings from '@/Vue/components/profile/TheVolumeSettings.vue'

export default {
	components: { TheVolumeSettings },

	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		return {
			onMenuClick
		}
	}
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-simple-settings {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.the-simple-settings-container {
			width: calc(100% - 16px);
			max-width: 1000px;
			text-align: start;
			background: $COLOR_BACKGROUND_GAME_MENU;
			border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
			border-radius: 16px;
			padding: 16px 32px;
			overflow-y: auto;
			display: flex;
			align-items: center;
		}
	}
</style>
