<template>
	<div class="pixi">
		<div class="background" />
		<div ref="gameContainer" class="game-container"></div>
		<pixi-user-interface class="pixi-user-interface" />
		<pixi-novel-overlay />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import Core from '../../../Pixi/Core'
import PixiUserInterface from '@/Vue/components/pixi/PixiUserInterface.vue'
import { isMobile } from '@/utils/Utils'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import PixiNovelOverlay from './PixiNovelOverlay.vue'
import axios from 'axios'
import GameMessage from '@shared/models/network/GameMessage'

export default defineComponent({
	components: {
		PixiUserInterface,
		PixiNovelOverlay,
	},

	setup() {
		store.dispatch.gameStateModule.setGameLoading()
		store.dispatch.gameStateModule.setGameData(store.state.currentGame!)
		if (isMobile()) {
			// const elem = document.documentElement
			// if (elem.requestFullscreen) {elem.requestFullscreen()}
			// window.scrollTo(0, 1)
		}

		const gameContainer = ref<HTMLElement>()
		onMounted(() => {
			window.addEventListener('resize', onWindowResize)
			window.addEventListener('keydown', onHotkeyPress)
			window.addEventListener('keyup', onHotkeyRelease)

			console.log('Init!')
			Core.init(store.state.currentGame!, store.state.selectedDeckId, gameContainer.value!)
		})

		onBeforeUnmount(() => {
			window.removeEventListener('resize', onWindowResize)
			window.removeEventListener('keydown', onHotkeyPress)
			window.removeEventListener('keyup', onHotkeyRelease)
			if (Core.socket && Core.socket.readyState === Core.socket.OPEN) {
				Core.socket.close(1000, 'Pixi unmount')
			}
		})

		const onWindowResize = (): void => {
			Core.renderer.resize()
		}

		const onHotkeyPress = async (event: KeyboardEvent): Promise<void> => {
			if (event.code === 'Space' && !event.shiftKey) {
				store.commit.hotkeysModule.setFastAnimation(true)
			} else if (event.code === 'ShiftLeft' && store.state.hotkeysModule.fastAnimation) {
				store.commit.hotkeysModule.setFastAnimation(false)
				store.commit.hotkeysModule.setUltraFastAnimation(true)
			} else if (event.code === 'Space' && event.shiftKey) {
				store.commit.hotkeysModule.setUltraFastAnimation(true)
			}

			/* Development-only shortcuts */
			if (process.env.NODE_ENV !== 'development' || !event.shiftKey || !event.altKey) {
				return
			}
			// Restart
			if (event.code === 'KeyQ') {
				event.preventDefault()
				const selectedDeck = store.state.selectedDeckId
				await store.dispatch.surrenderGame()
				const response = await axios.post('/api/games', { ruleset: store.state.gameStateModule.ruleset!.class })
				const gameMessage: GameMessage = response.data.data
				store.commit.setSelectedDeckId(selectedDeck)
				await store.dispatch.joinGame(gameMessage)
			}
			// Reconnect
			if (event.code === 'KeyR') {
				event.preventDefault()
				const currentGame = store.state.currentGame
				const selectedDeck = store.state.selectedDeckId
				Core.socket.close(1000, 'Forced disconnect (testing purposes)')
				Core.cleanUp()
				store.commit.setCurrentGame(currentGame!)
				Core.init(currentGame!, selectedDeck, gameContainer.value!)
			}
			// Disconnect
			if (event.code === 'KeyD') {
				event.preventDefault()
				Core.socket.close(1000, 'Forced disconnect (testing purposes)')
			}
			// Surrender
			if (event.code === 'KeyS') {
				event.preventDefault()
				await store.dispatch.surrenderGame()
			}
		}

		const onHotkeyRelease = async (event: KeyboardEvent): Promise<void> => {
			if (event.code === 'Space') {
				store.commit.hotkeysModule.setFastAnimation(false)
				store.commit.hotkeysModule.setUltraFastAnimation(false)
			}
		}

		return {
			gameContainer,
			onWindowResize,
		}
	},
})
</script>

<style scoped lang="scss">
.pixi {
	min-width: 1366px;

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: url('../../assets/background-game.webp');
		background-size: cover;
		background-position-x: center;
		background-position-y: bottom;
	}
	.game-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		overflow: hidden;
	}
	.pixi-user-interface {
		z-index: 2;
	}
	.inspected-card {
		z-index: 3;
	}
}
</style>
