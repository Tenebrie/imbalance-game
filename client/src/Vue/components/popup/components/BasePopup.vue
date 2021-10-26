<template>
	<div class="popup">
		<div class="header-container">
			<h2>{{ header }}</h2>
			<div class="container" @click="onMenuClick">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
	props: {
		header: {
			type: String as PropType<string>,
		},
	},

	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		return {
			onMenuClick,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.popup {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow-y: hidden;

	h2 {
		text-align: start;
	}
}

.container {
	padding: 8px 24px 8px 16px;
	background: $COLOR_BACKGROUND_GAME_MENU;
	border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
	border-radius: 16px;
	overflow-y: hidden;
}
</style>
