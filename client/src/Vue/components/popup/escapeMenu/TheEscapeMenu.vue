<template>
	<div class="the-escape-menu">
		<div class="the-escape-menu-container">
			<div class="menu-section left" @click="onMenuClick">
				<tenebrie-logo class="logo" />
				<button @click="onShowDiscord" class="primary game-button">
					<span class="image"><img src="../../../assets/discord.svg" alt="Discord group link" /></span>
					Discord
				</button>
				<button @click="onShowGameLog" class="primary game-button">Game history</button>
				<div class="menu-separator"></div>
				<button @click="onShowPlayersDeck" class="primary game-button">Your deck</button>
				<button @click="onShowPlayersGraveyard" class="primary game-button">Your graveyard</button>
				<div class="menu-separator"></div>
				<button @click="onShowOpponentsGraveyard" class="primary game-button">Opponent graveyard</button>
				<div class="menu-separator"></div>
				<button @click="onSurrender" class="primary game-button destructive">Surrender</button>
			</div>
			<div class="menu-section right" @click="onMenuClick">
				<div class="hotkeys">
					<h2>Hotkeys:</h2>
					<div class="hotkey"><span class="header">(Hold) Space:</span> Faster animations</div>
					<div class="hotkey"><span class="header">(Hold) Shift+Space:</span> Much faster animations</div>
					<div v-if="showDevHotkeys">
						<div class="hotkey">
							<span class="prefix">(Dev)</span> <span class="header">Shift+Alt+Q:</span> Create a new game with current ruleset
						</div>
						<div class="hotkey">
							<span class="prefix">(Dev)</span> <span class="header">Shift+Alt+R:</span> Reconnect to the current game
						</div>
						<div class="hotkey">
							<span class="prefix">(Dev)</span> <span class="header">Shift+Alt+D:</span> Force close connection to server
						</div>
						<div class="hotkey"><span class="prefix">(Dev)</span> <span class="header">Shift+Alt+S:</span> Surrender and leave</div>
					</div>
				</div>
				<div class="menu-separator"></div>
				<the-simple-settings />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import TheRulesetPopup from '@/Vue/components/popup/escapeMenu/TheRulesetPopup.vue'
import TheSimpleSettings from '@/Vue/components/popup/escapeMenu/TheSimpleSettings.vue'
import TheGameLog from '@/Vue/components/popup/gameLog/TheGameLog.vue'
import TenebrieLogo from '@/Vue/components/utils/TenebrieLogo.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		TheSimpleSettings,
		TenebrieLogo,
	},

	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onShowDiscord = (): void => {
			const win = window.open('https://discord.gg/9fSWxMnBFa', '_blank')!
			win.focus()
		}

		const onShowRules = (): void => {
			store.dispatch.popupModule.open({
				component: TheRulesetPopup,
			})
		}

		const onShowGameLog = (): void => {
			store.dispatch.popupModule.open({
				component: TheGameLog,
			})
		}

		const onShowPlayersDeck = (): void => {
			store.dispatch.popupModule.close()
			OutgoingMessageHandlers.requestShowPlayersDeck()
		}

		const onShowPlayersGraveyard = (): void => {
			store.dispatch.popupModule.close()
			OutgoingMessageHandlers.requestShowPlayersGraveyard()
		}

		const onShowOpponentsGraveyard = (): void => {
			store.dispatch.popupModule.close()
			OutgoingMessageHandlers.requestShowOpponentsGraveyard()
		}

		const onSurrender = (): void => {
			store.dispatch.surrenderGame()
		}

		const showDevHotkeys = process.env.NODE_ENV === 'development'

		return {
			onShowDiscord,
			onMenuClick,
			onShowRules,
			onShowGameLog,
			onShowPlayersDeck,
			onShowPlayersGraveyard,
			onShowOpponentsGraveyard,
			onSurrender,
			showDevHotkeys,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-escape-menu {
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.the-escape-menu-container {
	display: flex;
	width: 100%;
	justify-content: center;
	& > * {
		margin: 4px;
	}
}

.menu-section {
	width: 100%;
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16px 32px;

	button {
		width: 100%;
		margin: 8px;

		span.image {
			display: inline-block;
			position: relative;
			img {
				position: absolute;
				width: 30px;
				right: 0;
				top: -20px;
			}
		}
	}

	&.left {
		flex: 1;
		max-width: 300px;
		background: rgba(white, 0.5);
		border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
	}

	&.right {
		height: fit-content;
		flex: 2;
		padding-top: 0;
		max-width: 600px;
		background: darken($COLOR_BACKGROUND_GAME_MENU, 50);
		border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
		backdrop-filter: blur(1px);

		.menu-separator {
			background: rgba(white, 0.7);
		}
	}
}

.hotkeys {
	width: 100%;
	text-align: start;
	.hotkey {
		width: 100%;
		margin-bottom: 4px;
	}
	.prefix {
		color: gray;
	}
	.header {
		color: $COLOR-SECONDARY;
		font-weight: bold;
	}
}

.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: rgba(black, 0.7);
}

.logo {
	height: 170px;
}
</style>
