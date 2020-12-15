<template>
	<div class="the-challenge-ai-selection">
		<div class="container" @click="onMenuClick">
			<h2>AI Difficulty</h2>
			<button @click="onEasySelected" class="primary game-button">Easy: <b>Dummy</b></button>
			<button @click="onNormalSelected" class="primary game-button">Normal: <b>Vel'Elleron</b></button>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import axios from 'axios'
import GameMode from '@shared/enums/GameMode'
import GameMessage from '@shared/models/network/GameMessage'
import ChallengeAIDifficulty from '@shared/enums/ChallengeAIDifficulty'

export default {
	setup() {
		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		const onEasySelected = async (): Promise<void> => {
			store.dispatch.popupModule.close()
			const response = await axios.post('/api/games', { mode: GameMode.VS_AI, difficulty: ChallengeAIDifficulty.EASY })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

		const onNormalSelected = async (): Promise<void> => {
			store.dispatch.popupModule.close()
			const response = await axios.post('/api/games', { mode: GameMode.VS_AI, difficulty: ChallengeAIDifficulty.NORMAL })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		}

		return {
			onMenuClick,
			onEasySelected,
			onNormalSelected,
		}
	},

}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-challenge-ai-selection {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.container {
		border-radius: 16px;
		width: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: $COLOR-BACKGROUND-TRANSPARENT;
		padding: 16px 32px;

		button {
			width: 100%;
			margin: 8px;
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
