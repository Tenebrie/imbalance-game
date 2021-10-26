<template>
	<div class="the-ruleset-popup">
		<div class="the-ruleset-popup-container" @click="onMenuClick">
			<div class="the-ruleset-popup-scroller">
				<the-rules-list />
			</div>
			<base-popup-buttons>
				<button @click="onConfirm" class="primary game-button">OK</button>
			</base-popup-buttons>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import BasePopupButtons from '@/Vue/components/popup/components/BasePopupButtons.vue'
import TheRulesList from '@/Vue/components/rules/TheRulesList.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		BasePopupButtons,
		TheRulesList,
	},

	setup() {
		const onMenuClick = (event: MouseEvent) => {
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

.the-ruleset-popup {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow-y: hidden;
}

.the-ruleset-popup-container {
	width: calc(100% - 16px);
	height: calc(100% - 64px);
	max-width: 960px;
	background: $COLOR_BACKGROUND_GAME_MENU;
	padding: 8px 24px 8px 16px;
	border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
	border-radius: 16px;
	overflow-y: hidden;
}

.the-ruleset-popup-scroller {
	overflow-y: auto;
	width: 100%;
	height: calc(100% - 64px);
	padding: 0 8px;
}
</style>
