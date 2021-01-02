<template>
	<div class="the-welcome-popup">
		<div class="the-welcome-popup-container">
			<h1>Welcome!</h1>
			<div class="menu-separator"></div>
			<p>This is a little message from the dev team. Well, just me alone, really, but I am glad to see you here nonetheless!</p>
			<p>
				I have spent over a year working on this project, and it means a lot to finally get it out for people to see. It's still unfinished,
				of course. Most of the art assets you see will be replaced, some features are missing for sure, and there is still a lot of content
				to develop. However, I believe there is already fun to be had!
			</p>
			<p>
				If you're new, feel free to check out the ruleset description, it's in the navigation bar at the top (<b>Rules</b> section). After
				that, you can jump straight into the AI games from this very page.
			</p>
			<p>
				If you have questions, card ideas, have some feedback or just would like to chat, feel free to join our
				<a href="https://discord.gg/9fSWxMnBFa" target="_blank">Discord server</a>.
			</p>
			<p>Have fun!<br />- Tenebrie</p>
			<div class="menu-separator"></div>
			<div class="button-container">
				<button @click="onConfirm" class="primary game-button">OK</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
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

.the-welcome-popup {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-welcome-popup-container {
	border-radius: 16px;
	display: flex;
	width: 600px;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	background: $COLOR_BACKGROUND-TRANSPARENT;
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
