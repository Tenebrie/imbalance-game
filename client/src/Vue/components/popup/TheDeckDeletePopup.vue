<template>
	<div class="the-deck-delete-popup">
		<div class="the-deck-delete-container" @click="onMenuClick">
			<h1>Delete deck</h1>
			<p>Your deck "{{ deckName }}" will be deleted. This action really can't be reverted.</p>
			<div class="menu-separator"></div>
			<div class="button-container">
				<button @click="onConfirm" class="primary game-button destructive"><i class="fas fa-trash" /> Delete</button>
				<button @click="onBack" class="secondary game-button">Cancel</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onConfirm = (): void => {
			store.getters.popupModule.onConfirm()
			store.dispatch.popupModule.close()
		}

		const onBack = (): void => {
			store.dispatch.popupModule.close()
		}

		const deckName = computed<string>(() => store.getters.popupModule.params?.deckName || '')

		return {
			deckName,
			onMenuClick,
			onConfirm,
			onBack,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-deck-delete-popup {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-deck-delete-container {
	border-radius: 16px;
	display: flex;
	width: 600px;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	background: rgba(black, 0.5);
	border: 1px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
	padding: 16px 32px;

	button {
		width: 100%;
		margin: 8px;
	}
}

p {
	margin-bottom: 0.25em;
	line-height: 1.6em;
	text-align: start;
}

h1 {
	margin-bottom: 0;
}

.button-container {
	width: 100%;
	display: flex;
}

a {
	color: lightblue;
}
a:active {
	color: darken(lightblue, 50);
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: $COLOR_BACKGROUND_GAME_MENU_BORDER;
}
</style>
