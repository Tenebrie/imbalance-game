<template>
	<div class="the-game-collapse-popup">
		<div class="the-game-collapse-popup-container">
			<h1>Whoops...</h1>
			<div class="menu-separator"></div>
			<p>It seems that an error has occurred, and the game has collapsed. Most likely that is because of a bug in the code.</p>
			<p>
				The details of the error have been recorded, but if you want to attract the dev's attention to this exact bug, please submit a bug
				report on our <DiscordLink>Discord server</DiscordLink>, describing the action you have attempted to make, or the last thing that
				happened.
			</p>
			<p>Please include the following:</p>
			<table>
				<tr>
					<td class="header">Game ID:</td>
					<td>{{ params.gameId }}</td>
				</tr>
				<tr>
					<td class="header">Player ID:</td>
					<td>{{ params.playerId }}</td>
				</tr>
				<tr>
					<td class="header">Timestamp:</td>
					<td>{{ params.timestamp }}</td>
				</tr>
			</table>
			<div class="menu-separator"></div>
			<div class="button-container">
				<button @click="onConfirm" class="primary game-button">OK</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { defineComponent } from 'vue'
import GameCollapseMessageData from '@shared/models/network/GameCollapseMessageData'
import DiscordLink from '@/Vue/components/utils/DiscordLink.vue'

export default defineComponent({
	components: { DiscordLink },
	setup() {
		const params = store.getters.popupModule.params as GameCollapseMessageData

		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onConfirm = (): void => {
			store.dispatch.popupModule.close()
		}

		return {
			params,
			onMenuClick,
			onConfirm,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-game-collapse-popup {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-game-collapse-popup-container {
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

table {
	text-align: start;

	td.header {
		font-weight: bold;
		min-width: 100px;
	}
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: $COLOR_BACKGROUND_GAME_MENU_BORDER;
}
</style>
