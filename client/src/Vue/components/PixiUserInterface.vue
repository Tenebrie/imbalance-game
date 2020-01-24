<template>
	<div class="pixi-user-interface">
		<div class="end-turn-button-container">
			<button @click="onEndTurn" class="game-button" :disabled="!isPlayersTurn">End turn</button>
		</div>
		<div class="fade-in-overlay" :class="fadeInOverlayClass">
			Waiting for opponent...
		</div>
		<div v-if="isEscapeWindowVisible" class="escape-menu-container">
			<div class="escape-menu">
				<button @click="onShowChangelog" class="game-button">Changelog</button>
				<button @click="onShowSettings" class="game-button">Settings</button>
				<div class="menu-separator"></div>
				<button @click="onLeaveGame" class="game-button destructive">Leave game</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'

export default Vue.extend({
	data: () => ({
		isEscapeWindowVisible: false as boolean
	}),

	mounted(): void {
		window.addEventListener('keydown', this.onKeyDown)
	},

	computed: {
		isPlayersTurn(): boolean {
			return store.state.gameStateModule.isPlayersTurn
		},

		isGameStarted(): boolean {
			console.log(store.state.gameStateModule.isGameStarted)
			return store.state.gameStateModule.isGameStarted
		},

		fadeInOverlayClass(): {} {
			console.log('Overlay class!')
			return {
				visible: !this.isGameStarted as boolean
			}
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
	.pixi-user-interface {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
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

		button {
			border: none;
			outline: none;
			pointer-events: auto;

			padding: 8px 16px;
			font-size: 24px;
			color: white;
			background: #2c3e50;

			border-radius: 4px;

			&:hover {
				background: darken(#2c3e50, 5);
			}
			&:active {
				color: darken(white, 5);
				background: darken(#2c3e50, 10);
			}
			&:disabled {
				cursor: default;
				background: gray;
			}
			&.destructive {
				color: red;
				&:active {
					color: darken(red, 5);
					background: darken(#2c3e50, 10);
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
