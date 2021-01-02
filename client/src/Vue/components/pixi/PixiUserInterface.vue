<template>
	<div class="pixi-user-interface">
		<div class="settings-button-container">
			<button @click="onShowGameLog" class="primary borderless game-button"><i class="fas fa-history"></i></button>
			<button @click="onShowEscapeMenu" class="primary borderless game-button"><i class="fas fa-cog"></i></button>
		</div>
		<div class="end-turn-button-container" v-if="isEndTurnButtonVisible">
			<div>
				<button @click="onEndTurn" class="primary game-button" v-if="!isEndRoundButtonVisible" :disabled="!isPlayersTurn">End turn</button>
				<button @click="onEndTurn" class="primary game-button destructive" v-if="isEndRoundButtonVisible" :disabled="!isPlayersTurn">
					End round
				</button>
			</div>
		</div>
		<div class="mulligan-label-container" v-if="mulliganMode">
			<div>Replace cards ({{ maxCardMulligans - cardsMulliganed }}/{{ maxCardMulligans }})</div>
		</div>
		<div class="confirm-targets-button-container" v-if="isConfirmTargetsButtonVisible">
			<div :class="confirmTargetsButtonContainerClass">
				<button @click="onConfirmTargets" class="primary game-button button">Confirm</button>
				<button @click="onSortCards" class="secondary game-button button" v-if="mulliganMode">Sort cards</button>
				<button @click="onToggleVisibility" class="secondary game-button button">
					<span class="show-hide-button" v-if="!cardsVisible">Show</span>
					<span class="show-hide-button" v-if="cardsVisible">Hide</span>
				</button>
			</div>
		</div>
		<div class="confirm-targets-button-container" v-if="isHideTargetsButtonVisible">
			<div :class="confirmTargetsButtonContainerClass">
				<button @click="onToggleVisibility" class="secondary game-button button">
					<span class="show-hide-button" v-if="!cardsVisible">Show</span>
					<span class="show-hide-button" v-if="cardsVisible">Hide</span>
				</button>
			</div>
		</div>
		<div class="inspected-card">
			<pixi-inspected-card />
		</div>
		<div class="fade-in-overlay" :class="fadeInOverlayClass">
			<div class="overlay-message" v-if="!opponent">Connecting...</div>
			<div class="overlay-message" v-if="opponent">
				{{ player.username }} vs {{ opponent.username }}<br />
				Starting the game...
			</div>
		</div>
		<div class="endgame-screen" :class="gameEndScreenClass">
			<div class="victory" v-if="isVictory">Victory!</div>
			<div class="defeat" v-if="isDefeat">Defeat</div>
			<div class="draw" v-if="isDraw">Draw</div>
		</div>
		<div class="spectator-overlay" :class="spectatorOverlayClass">Spectator mode</div>
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
import { computed, onMounted, onUnmounted } from '@vue/composition-api'
import Core from '@/Pixi/Core'
import Utils from '@/utils/Utils'
import TargetMode from '@shared/enums/TargetMode'

export default Vue.extend({
	components: {
		PixiInspectedCard,
	},
	setup() {
		onMounted(() => window.addEventListener('keydown', onKeyDown))
		onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.defaultPrevented) {
				return
			}
			if (event.key === 'Escape') {
				if (isConfirmTargetsButtonVisible.value && !mulliganMode) {
					onConfirmTargets()
					return
				}
				onShowEscapeMenu()
			}
		}

		const onEndTurn = (): void => {
			OutgoingMessageHandlers.sendEndTurn()
		}

		const onConfirmTargets = (): void => {
			OutgoingMessageHandlers.sendConfirmTargets(Core.input.forcedTargetingMode.targetMode)
		}

		const onSortCards = (): void => {
			if (!Core.input) {
				return
			}
			Core.input.forcedTargetingCards = Utils.sortCards(Core.input.forcedTargetingCards)
		}

		const onToggleVisibility = (): void => {
			if (!Core.input || !Core.input.forcedTargetingMode) {
				return
			}
			store.commit.gameStateModule.setPopupTargetingCardsVisible(!store.state.gameStateModule.popupTargetingCardsVisible)
		}

		const onShowGameLog = (): void => {
			store.dispatch.popupModule.open({
				component: TheGameLog,
			})
		}

		const onShowEscapeMenu = (): void => {
			store.dispatch.popupModule.open({
				component: TheEscapeMenu,
			})
		}

		const isEndRoundButtonVisible = computed(() => store.state.gameStateModule.playerUnitMana > 0)
		const isPlayersTurn = computed(() => {
			return store.state.gameStateModule.isPlayersTurn && store.state.gameStateModule.gameStatus === ClientGameStatus.IN_PROGRESS
		})
		const isGameStarted = computed(() => {
			const status = store.state.gameStateModule.gameStatus
			return (
				status === ClientGameStatus.IN_PROGRESS ||
				status === ClientGameStatus.VICTORY ||
				status === ClientGameStatus.DEFEAT ||
				status === ClientGameStatus.DRAW
			)
		})
		const isEndTurnButtonVisible = computed(() => {
			return store.state.gameStateModule.popupTargetingMode === null
		})
		const isBrowsingDeck = computed(() => {
			return store.state.gameStateModule.popupTargetingMode === TargetMode.BROWSE
		})
		const mulliganMode = computed(() => {
			return store.state.gameStateModule.popupTargetingMode === TargetMode.MULLIGAN
		})
		const isConfirmTargetsButtonVisible = computed(() => {
			return isBrowsingDeck.value || mulliganMode.value
		})
		const isHideTargetsButtonVisible = computed(() => {
			return (
				!isConfirmTargetsButtonVisible.value &&
				store.state.gameStateModule.popupTargetingMode !== null &&
				store.state.gameStateModule.popupTargetingCardCount > 0
			)
		})
		const cardsVisible = computed(() => store.state.gameStateModule.popupTargetingCardsVisible)
		const confirmTargetsButtonContainerClass = computed(() => ({
			backgrounded: !cardsVisible.value,
		}))

		const isVictory = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.VICTORY)
		const isDefeat = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DEFEAT)
		const isDraw = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DRAW)
		const isSpectating = computed(() => store.state.gameStateModule.isSpectating)

		const fadeInOverlayClass = computed(() => ({
			visible: !isGameStarted.value,
		}))
		const gameEndScreenClass = computed(() => ({
			visible: isVictory.value || isDefeat.value || isDraw.value,
		}))
		const spectatorOverlayClass = computed(() => ({
			visible: isSpectating.value,
		}))

		const player = computed<Player>(() => store.state.player)
		const opponent = computed<Player | null>(() => store.state.gameStateModule.opponent)

		const cardsMulliganed = computed(() => store.state.gameStateModule.cardsMulliganed)
		const maxCardMulligans = computed(() => store.state.gameStateModule.maxCardMulligans)

		return {
			store,
			player,
			opponent,
			isVictory,
			isDefeat,
			isDraw,
			isPlayersTurn,
			isEndTurnButtonVisible,
			isEndRoundButtonVisible,
			mulliganMode,
			isConfirmTargetsButtonVisible,
			isHideTargetsButtonVisible,
			cardsVisible,
			confirmTargetsButtonContainerClass,
			onEndTurn,
			onConfirmTargets,
			onSortCards,
			onToggleVisibility,
			onShowGameLog,
			onShowEscapeMenu,
			fadeInOverlayClass,
			gameEndScreenClass,
			spectatorOverlayClass,
			cardsMulliganed,
			maxCardMulligans,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

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
		transition: opacity 0.5s;
		transition-delay: 0.25s;

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
		outline: none;
		pointer-events: auto;
		max-width: 250px;

		padding: 8px 16px;
		font-size: 24px;
		border-radius: 4px;

		&.borderless {
			border: none;
		}

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
	}

	.confirm-targets-button-container {
		position: absolute;
		right: 0;
		height: calc(100% - 92px);
		display: flex;
		padding: 64px;
		min-width: 250px;
		align-items: flex-end;
		justify-content: center;

		& > div {
			width: 250px;
			pointer-events: all;
			padding: 12px 14px;
			border: 1px solid transparent;
			border-radius: 8px;
			background: rgba(black, 0);

			$TRANSITION-DURATION: 1s;
			transition: background-color $TRANSITION-DURATION, border-top-color $TRANSITION-DURATION, border-left-color $TRANSITION-DURATION,
				border-right-color $TRANSITION-DURATION, border-bottom-color $TRANSITION-DURATION;

			&.backgrounded {
				background: rgba(black, 0.75);
				border: 1px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
			}
		}
	}
}

.spectator-overlay {
	position: absolute;
	right: 0;
	bottom: 0;
	padding: 8px 16px;
	color: rgba(gray, 0.5);
	font-size: 16px;

	display: none;
	&.visible {
		display: block;
	}
}

.mulligan-label-container {
	position: absolute;
	width: 100%;
	top: 128px;
	font-size: 36px;
	font-weight: bold;
}

.menu-separator {
	width: 100%;
	height: 1px;
	background: black;
	margin: 8px 0;
}
</style>
