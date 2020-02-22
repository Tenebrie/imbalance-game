<template>
	<div class="pixi-user-interface">
		<div class="end-turn-button-container">
			<button @click="onEndTurn" class="primary game-button" v-if="!isEndRoundButtonVisible" :disabled="!isPlayersTurn">End turn</button>
			<button @click="onEndTurn" class="primary game-button destructive" v-if="isEndRoundButtonVisible" :disabled="!isPlayersTurn">End round</button>
		</div>
		<div class="fade-in-overlay" :class="fadeInOverlayClass">
			<span class="overlay-message" v-if="!opponent">Waiting for opponent...</span>
			<span class="overlay-message" v-if="opponent">{{ opponent.username }} has connected.<br>Waiting for the game to start...</span>
		</div>
		<div class="endgame-screen" :class="endgameScreenClass">
			<div class="victory" v-if="isVictory">Victory!</div>
			<div class="defeat" v-if="isDefeat">Defeat</div>
			<div class="draw" v-if="isDraw">Draw</div>
		</div>
		<div v-if="isEscapeWindowVisible" class="escape-menu-container">
			<div class="escape-menu">
				<button @click="onShowSettings" class="primary game-button">Settings</button>
				<div class="menu-separator"></div>
				<button @click="onLeaveGame" class="primary game-button destructive">Leave game</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Player from '@/Pixi/shared/models/Player'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'

export default Vue.extend({
	data: () => ({
		isEscapeWindowVisible: false as boolean
	}),

	mounted(): void {
		window.addEventListener('keydown', this.onKeyDown)
	},

	computed: {
		isEndRoundButtonVisible(): boolean {
			return store.state.gameStateModule.playerUnitMana > 0
		},

		isPlayersTurn(): boolean {
			return store.state.gameStateModule.isPlayersTurn && store.state.gameStateModule.gameStatus === ClientGameStatus.IN_PROGRESS
		},

		isGameStarted(): boolean {
			const status = store.state.gameStateModule.gameStatus
			return status === ClientGameStatus.IN_PROGRESS || status === ClientGameStatus.VICTORY || status === ClientGameStatus.DEFEAT || status === ClientGameStatus.DRAW
		},

		fadeInOverlayClass(): {} {
			return {
				visible: !this.isGameStarted as boolean
			}
		},

		isVictory(): boolean {
			return store.state.gameStateModule.gameStatus === ClientGameStatus.VICTORY
		},

		isDefeat(): boolean {
			return store.state.gameStateModule.gameStatus === ClientGameStatus.DEFEAT
		},

		isDraw(): boolean {
			return store.state.gameStateModule.gameStatus === ClientGameStatus.DRAW
		},

		endgameScreenClass(): {} {
			return {
				visible: (this.isVictory || this.isDefeat || this.isDraw) as boolean
			}
		},

		opponent(): Player | null {
			return store.state.gameStateModule.opponent
		}
	},

	methods: {
		onKeyDown(event: KeyboardEvent): void {
			if (event.key === 'Escape') {
				this.isEscapeWindowVisible = !this.isEscapeWindowVisible
			}
		},

		onShowChangelog(): void {
			window.open('changelog')
		},

		onShowSettings(): void {
			// TODO: Implement settings page
			window.alert('Not yet!')
		},

		onLeaveGame(): void {
			store.dispatch.leaveGame()
		},

		onEndTurn(): void {
			OutgoingMessageHandlers.sendEndTurn()
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

		.fade-in-overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			background: black;

			opacity: 0;
			transition: opacity 1s;
			transition-delay: 0.5s;

			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 40px;
			font-family: BrushScript, Roboto, sans-serif;

			&.visible {
				opacity: 1;
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

		.escape-menu-container {
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;

			.escape-menu {
				height: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				background: #BBBBBBBB;
				padding: 16px;

				button {
					width: 100%;
					margin: 8px;
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
