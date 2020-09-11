<template>
	<div class="pixi-user-interface">
		<div class="settings-button-container">
			<button @click="onShowGameLog" class="primary game-button"><i class="fas fa-history"></i></button>
			<button @click="onShowEscapeMenu" class="primary game-button"><i class="fas fa-cog"></i></button>
		</div>
		<div class="end-turn-button-container">
			<button @click="onEndTurn" class="primary game-button" v-if="!isEndRoundButtonVisible" :disabled="!isPlayersTurn">End turn</button>
			<button @click="onEndTurn" class="primary game-button destructive" v-if="isEndRoundButtonVisible" :disabled="!isPlayersTurn">End round</button>
		</div>
		<div class="inspected-card">
			<pixi-inspected-card />
		</div>
		<div class="fade-in-overlay" :class="fadeInOverlayClass">
			<div class="overlay-message" v-if="!opponent">Waiting for opponent...</div>
			<div class="overlay-message" v-if="opponent">
				{{ opponent.username }} has connected.<br>
				Waiting for the game to start...
			</div>
		</div>
		<div class="endgame-screen" :class="gameEndScreenClass">
			<div class="victory" v-if="isVictory">Victory!</div>
			<div class="defeat" v-if="isDefeat">Defeat</div>
			<div class="draw" v-if="isDraw">Draw</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Player from '@shared/models/Player'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'
import TheGameLog from '@/Vue/components/popup/gameLog/TheGameLog.vue'
import PixiInspectedCard from '@/Vue/components/pixi/PixiInspectedCard.vue'
import TheEscapeMenu from '@/Vue/components/popup/escapeMenu/TheEscapeMenu.vue'
import {computed, onMounted, onUnmounted} from '@vue/composition-api'

export default Vue.extend({
	components: {
		PixiInspectedCard
	},
	setup() {
		onMounted(() => window.addEventListener('keydown', onKeyDown))
		onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.defaultPrevented) {
				return
			}
			if (event.key === 'Escape') {
				onShowEscapeMenu()
			}
		}

		const onEndTurn = (): void => {
			OutgoingMessageHandlers.sendEndTurn()
		}

		const onShowGameLog = (): void => {
			store.dispatch.popupModule.open({
				component: TheGameLog
			})
		}

		const onShowEscapeMenu = (): void => {
			store.dispatch.popupModule.open({
				component: TheEscapeMenu
			})
		}

		const isEndRoundButtonVisible = computed(() => store.state.gameStateModule.playerUnitMana > 0)
		const isPlayersTurn = computed(() => {
			return store.state.gameStateModule.isPlayersTurn && store.state.gameStateModule.gameStatus === ClientGameStatus.IN_PROGRESS
		})
		const isGameStarted = computed(() => {
			const status = store.state.gameStateModule.gameStatus
			return status === ClientGameStatus.IN_PROGRESS || status === ClientGameStatus.VICTORY || status === ClientGameStatus.DEFEAT || status === ClientGameStatus.DRAW
		})

		const isVictory = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.VICTORY)
		const isDefeat = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DEFEAT)
		const isDraw = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DRAW)

		const fadeInOverlayClass = computed(() => ({
			visible: !isGameStarted.value
		}))
		const gameEndScreenClass = computed(() => ({
			visible: isVictory.value || isDefeat.value || isDraw.value
		}))

		const opponent = computed<Player | null>(() => store.state.gameStateModule.opponent)

		return {
			opponent,
			isVictory,
			isDefeat,
			isDraw,
			isPlayersTurn,
			isEndRoundButtonVisible,
			onEndTurn,
			onShowGameLog,
			onShowEscapeMenu,
			fadeInOverlayClass,
			gameEndScreenClass,
			store,
		}
	}
})
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.pixi-user-interface {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		user-select: none;
		pointer-events: none;
		overflow: hidden;

		&.non-interactive {

		}

		.fade-in-overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			background: black;

			opacity: 0;
			transition: opacity 1s;
			transition-delay: 0.5s;

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 40px;
			font-family: BrushScript, Roboto, sans-serif;

			&.visible {
				opacity: 1;
			}

			.overlay-message {
			}
		}

		.endgame-screen {
			position: absolute;
			width: 100%;
			height: 100%;
			color: $COLOR-TEXT;
			font-family: BrushScript, sans-serif;
			font-size: 8em;
			background: rgba(black, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;

			opacity: 0;
			transition: opacity 1s;

			&.visible {
				opacity: 1;
			}
		}

		button.game-button {
			border: none;
			outline: none;
			pointer-events: auto;
			max-width: 250px;

			padding: 8px 16px;
			font-size: 24px;
			border-radius: 4px;

			&:disabled {
				cursor: default;
				background: gray;
			}
			&.destructive {
				color: lighten(red, 15);
				&:hover {
					color: lighten(red, 10);
				}
				&:active {
					color: lighten(red, 5);
				}
			}
		}

		.inspected-card {
			pointer-events: auto;
		}

		.settings-button-container {
			position: absolute;
			top: 0;
			right: 0;
			display: flex;
			flex-direction: row;

			& > button {
				padding: 16px 24px;
				margin: 0;
				background: transparent;
				color: white;
				font-size: 32px;

				&:hover {
					color: darken(white, 10);
				}
				&:active {
					color: darken(white, 20);
				}
			}
		}

		.end-turn-button-container {
			position: absolute;
			right: 0;
			height: calc(100% - 128px);
			display: flex;
			padding: 64px;
			align-items: center;
			justify-content: center;

			.end-turn-button:disabled {

			}
		}
	}

	.menu-separator {
		width: 100%;
		height: 1px;
		background: black;
		margin: 8px 0;
	}
</style>
