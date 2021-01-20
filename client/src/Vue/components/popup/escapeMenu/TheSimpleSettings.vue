<template>
	<div class="the-simple-settings">
		<div class="the-simple-settings-container" @click="onMenuClick">
			<the-volume-settings />
			<div class="info">
				<span class="header">Note:</span> More settings available in the user profile menu (top right corner) when not in game.
			</div>
			<div class="menu-separator"></div>
			<div class="button-container">
				<button @click="onConfirm" class="primary game-button">OK</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import TheVolumeSettings from '@/Vue/components/profile/TheVolumeSettings.vue'
import store from '@/Vue/store'
import { defineComponent } from 'vue'

export default defineComponent({
	components: { TheVolumeSettings },

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
		border: 1px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
		border-radius: 16px;
		padding: 16px 32px;
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

	.button-container {
		width: 100%;
	}
}
</style>
