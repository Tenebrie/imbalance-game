<template>
	<div class="pixi-user-interface">
		<div class="end-turn-button-container">
			<button @click="onEndTurn" class="game-button end-turn-button" :disabled="!isPlayersTurn">End turn</button>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'

export default Vue.extend({
	mounted(): void {

	},

	computed: {
		isPlayersTurn(): boolean {
			return store.state.userInterfaceModule.isPlayersTurn
		}
	},

	methods: {
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
</style>
