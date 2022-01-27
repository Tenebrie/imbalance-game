<template>
	<div class="pixi-user-interface">
		<div class="opponent-smokescreen-container" :class="opponentRoundEndOverlayClass">
			<span>Round finished</span>
		</div>
		<div class="settings-button-container">
			<button @click="onShowGameLog" class="primary borderless game-button"><i class="fas fa-history"></i></button>
			<button @click="onShowEscapeMenu" class="primary borderless game-button"><i class="fas fa-cog"></i></button>
		</div>
		<the-popup-view class="popup-view" />
		<button class="player-deck-button-container" @click="onPlayerDeckClicked">
			<img src="../../assets/icons/icon-deck.svg" />
		</button>
		<button class="player-graveyard-button-container" @click="onPlayerGraveyardClicked">
			<img src="../../assets/icons/icon-graveyard.svg" />
		</button>
		<button class="opponent-graveyard-button-container" @click="onOpponentGraveyardClicked">
			<img src="../../assets/icons/icon-graveyard.svg" />
		</button>
		<button class="game-objective-button-container" @click="onGameObjectiveClicked" v-if="currentObjective">
			<img src="../../assets/icons/icon-objective.svg" alt="Game objective button" />
		</button>
		<div class="objective-container" :class="objectiveContainerClass" v-if="currentObjective" data-testid="objective-container">
			<div class="objective-content">
				<div>
					<div class="objective-title">{{ currentObjective.title }}:</div>
					<div class="objective-description">{{ currentObjective.description }}</div>
				</div>
				<div class="objective-modifiers" v-if="currentObjective.modifiers && currentObjective.modifiers.length > 0">
					<div class="objective-title">Modifiers:</div>
					<div v-for="(modifier, index) in currentObjective.modifiers" :key="index">
						-
						<span v-if="Array.isArray(modifier)">
							<span class="objective-title">{{ modifier[0] }}: </span>
							<span class="objective-description">{{ modifier[1] }}</span>
						</span>
						<span v-if="!Array.isArray(modifier)">
							<span class="objective-description">{{ modifier }} </span>
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class="end-turn-button-container" v-if="isEndTurnButtonVisible">
			<div class="player-name">
				<span v-if="opponent">{{ opponent.username }}</span
				><span v-if="!opponent">Opponent</span>
			</div>
			<PixiPointDisplay header="Mana" :value="opponentSpellMana" :limit="10" :in-danger="0" />
			<PixiPointDisplay header="Round wins" :value="opponentRoundWins" :limit="roundWinsRequired" :in-danger="0" />
			<PixiEndTurnArea />
			<PixiPointDisplay header="Round wins" :value="playerRoundWins" :limit="roundWinsRequired" :in-danger="0" />
			<PixiPointDisplay header="Mana" :value="playerSpellMana" :limit="10" :in-danger="playerSpellManaInDanger" />
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
			<div class="overlay-message" v-if="isPlayingVersusAI && !isChainingGameMode && !isAnyVictoryCondition">Connecting...</div>
			<div class="overlay-message" v-if="isPlayingCoop && !isChainingGameMode && !isAnyVictoryCondition">
				<p>Waiting for players...</p>
				<p class="waiting-for-players">
					Players in lobby (<b>{{ playerSlotsFilled }}</b> / <b>{{ totalPlayerSlots }}):</b>
				</p>
				<p class="player-list">
					<span v-for="player in playersInLobby" :key="player.id">{{ player.username }}</span>
				</p>
			</div>
			<div class="overlay-message" v-if="!opponent && isPlayingVersusPlayer">
				<span>Waiting for another player to connect...<br />You may also choose to play vs AI from the main menu</span>
				<button class="secondary game-button" @click="onLeaveGame">Leave game</button>
			</div>
			<div class="overlay-message" v-if="opponent && isPlayingVersusPlayer">
				{{ player.username }} vs {{ opponent.username }}<br />
				Starting the game...
			</div>
		</div>
		<div class="endgame-screen" :class="gameEndScreenClass">
			<div class="victory" v-if="isVictory">Victory!</div>
			<div class="defeat" v-if="isDefeat">Defeat</div>
			<div class="draw" v-if="isDraw">Draw</div>
			<button v-if="isVictory || isDefeat || isDraw" class="secondary game-button" @click="onLeaveAndContinue">Continue</button>
		</div>
		<div class="spectator-overlay" :class="spectatorOverlayClass">Spectator mode</div>
	</div>
</template>

<script lang="ts">
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import TargetMode from '@shared/enums/TargetMode'
import Player from '@shared/models/Player'
import { sortCards } from '@shared/Utils'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'

import Core from '@/Pixi/Core'
import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import PixiEndTurnArea from '@/Vue/components/pixi/PixiEndTurnArea.vue'
import PixiInspectedCard from '@/Vue/components/pixi/PixiInspectedCard.vue'
import PixiPointDisplay from '@/Vue/components/pixi/PixiPointDisplay.vue'
import TheEscapeMenu from '@/Vue/components/popup/escapeMenu/TheEscapeMenu.vue'
import TheGameLog from '@/Vue/components/popup/gameLog/TheGameLog.vue'
import TheInGameOpponentGraveyardPopup from '@/Vue/components/popup/inGameDeckView/TheInGameOpponentGraveyardPopup.vue'
import TheInGamePlayerDeckPopup from '@/Vue/components/popup/inGameDeckView/TheInGamePlayerDeckPopup.vue'
import TheInGamePlayerGraveyardPopup from '@/Vue/components/popup/inGameDeckView/TheInGamePlayerGraveyardPopup.vue'
import ThePopupView from '@/Vue/components/popup/ThePopupView.vue'
import store from '@/Vue/store'
import GameObjectiveStore from '@/Vue/store/GameObjectiveStore'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export default defineComponent({
	components: {
		ThePopupView,
		PixiEndTurnArea,
		PixiPointDisplay,
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
				if (store.state.novel.isActive && !store.state.novel.isMuted) {
					onShowEscapeMenu()
					return
				}

				if (isConfirmTargetsButtonVisible.value && !mulliganMode.value) {
					onConfirmTargets()
					return
				}
				if (GameObjectiveStore.state.popupVisible) {
					GameObjectiveStore.commit.hide()
					return
				}
				if (InspectedCardStore.getters.card) {
					InspectedCardStore.dispatch.undoCard()
					return
				}
				onShowEscapeMenu()
			}
		}

		const onConfirmTargets = (): void => {
			if (Core.input.forcedTargetingMode) {
				OutgoingMessageHandlers.sendConfirmTargets(Core.input.forcedTargetingMode.targetMode)
			}
		}

		const onSortCards = (): void => {
			if (!Core.input) {
				return
			}
			Core.input.forcedTargetingCards = sortCards(Core.input.forcedTargetingCards)
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

		const isSwitchingGames = computed(() => {
			return !!store.state.nextLinkedGame
		})
		const endScreenSuppressed = computed(() => {
			return store.state.gameStateModule.endScreenSuppressed
		})
		const isChainingGameMode = computed(() => {
			return store.state.gameStateModule.ruleset && store.state.gameStateModule.ruleset.category === RulesetCategory.RITES
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
		const isBrowsingDeck = computed(() => {
			return store.state.gameStateModule.targetingMode === TargetMode.BROWSE
		})
		const mulliganMode = computed(() => {
			return store.state.gameStateModule.targetingMode === TargetMode.MULLIGAN
		})
		const isConfirmTargetsButtonVisible = computed(() => {
			return isBrowsingDeck.value || mulliganMode.value
		})
		const isHideTargetsButtonVisible = computed(() => {
			return (
				!isConfirmTargetsButtonVisible.value &&
				store.state.gameStateModule.targetingMode !== null &&
				store.state.gameStateModule.popupTargetingCardCount > 0
			)
		})
		const cardsVisible = computed(() => store.state.gameStateModule.popupTargetingCardsVisible)
		const confirmTargetsButtonContainerClass = computed(() => ({
			backgrounded: !cardsVisible.value,
		}))
		const isEndTurnButtonVisible = computed(() => {
			return store.state.gameStateModule.targetingMode === null
		})

		const hasOpponentFinishedRound = computed(() => {
			return !store.state.gameStateModule.isOpponentInRound
		})

		const isVictory = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.VICTORY)
		const isDefeat = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DEFEAT)
		const isDraw = computed(() => store.state.gameStateModule.gameStatus === ClientGameStatus.DRAW)
		const isAnyVictoryCondition = computed(() => isVictory.value || isDraw.value || isDefeat.value)
		const isSpectating = computed(() => store.state.gameStateModule.isSpectating)
		const isOpponentFinishedRound = computed(
			() => !store.state.gameStateModule.isOpponentInRound && store.state.gameStateModule.isPlayerInRound
		)
		const isObjectiveVisible = computed(() => GameObjectiveStore.state.popupVisible)

		const fadeInOverlayClass = computed(() => ({
			visible: !isGameStarted.value || isSwitchingGames.value,
		}))
		const gameEndScreenClass = computed(() => ({
			visible: (isVictory.value || isDefeat.value || isDraw.value) && !endScreenSuppressed.value,
			noSmokescreen: isChainingGameMode.value,
		}))
		const spectatorOverlayClass = computed(() => ({
			visible: isSpectating.value,
		}))
		const opponentRoundEndOverlayClass = computed(() => ({
			visible: isOpponentFinishedRound.value,
		}))
		const objectiveContainerClass = computed(() => ({
			visible: isObjectiveVisible.value && !store.state.novel.isActive,
			'no-transition': store.state.novel.isActive,
		}))

		const onPlayerDeckClicked = () => {
			store.dispatch.popupModule.open({
				component: TheInGamePlayerDeckPopup,
			})
		}
		const onPlayerGraveyardClicked = () => {
			store.dispatch.popupModule.open({
				component: TheInGamePlayerGraveyardPopup,
			})
		}
		const onOpponentGraveyardClicked = () => {
			store.dispatch.popupModule.open({
				component: TheInGameOpponentGraveyardPopup,
			})
		}
		const onGameObjectiveClicked = () => {
			requestAnimationFrame(() => {
				GameObjectiveStore.commit.show()
			})
		}

		const player = computed<Player | null>(() => store.state.player)
		const opponent = computed<Player | null>(() => store.state.gameStateModule.opponent)

		const roundWinsRequired = computed<number>(() => store.state.gameStateModule.ruleset?.constants.ROUND_WINS_REQUIRED || 0)
		const playerRoundWins = computed<number>(() => store.state.gameStateModule.playerRoundWins)
		const playerSpellMana = computed<number>(() => store.state.gameStateModule.playerSpellMana)
		const playerSpellManaInDanger = computed<number>(() => store.state.gameStateModule.playerSpellManaInDanger)
		const opponentRoundWins = computed<number>(() => store.state.gameStateModule.opponentRoundWins)
		const opponentSpellMana = computed<number>(() => store.state.gameStateModule.opponentSpellMana)

		const cardsMulliganed = computed(() => store.state.gameStateModule.cardsMulliganed)
		const maxCardMulligans = computed(() => store.state.gameStateModule.maxCardMulligans)

		const isPlayingVersusAI = computed(() => store.state.gameStateModule.ruleset?.gameMode === GameMode.PVE)
		const isPlayingVersusPlayer = computed(() => store.state.gameStateModule.ruleset?.gameMode === GameMode.PVP)
		const isPlayingCoop = computed(() => store.state.gameStateModule.ruleset?.gameMode === GameMode.COOP)

		const playerSlotsFilled = computed(() => store.state.gameLobbyModule.totalPlayerSlots - store.state.gameLobbyModule.openPlayerSlots)
		const totalPlayerSlots = computed(() => store.state.gameLobbyModule.totalPlayerSlots)
		const playersInLobby = computed(() => store.state.gameLobbyModule.players)

		const currentObjective = computed(() => GameObjectiveStore.getters.current)

		const onLeaveGame = (): void => {
			store.dispatch.leaveGame()
			store.commit.clearNextLinkedGame()
		}

		const onLeaveAndContinue = (): void => {
			store.dispatch.leaveAndContinue()
		}

		return {
			store,
			player,
			opponent,
			isVictory,
			isDefeat,
			isDraw,
			isAnyVictoryCondition,
			mulliganMode,
			isConfirmTargetsButtonVisible,
			isHideTargetsButtonVisible,
			isEndTurnButtonVisible,
			isChainingGameMode,
			hasOpponentFinishedRound,
			cardsVisible,
			confirmTargetsButtonContainerClass,
			onConfirmTargets,
			onSortCards,
			onToggleVisibility,
			onShowGameLog,
			onShowEscapeMenu,
			fadeInOverlayClass,
			gameEndScreenClass,
			spectatorOverlayClass,
			opponentRoundEndOverlayClass,
			objectiveContainerClass,
			currentObjective,
			cardsMulliganed,
			maxCardMulligans,
			roundWinsRequired,
			playerRoundWins,
			playerSpellMana,
			playerSpellManaInDanger,
			opponentRoundWins,
			opponentSpellMana,
			isPlayingVersusAI,
			isPlayingVersusPlayer,
			isPlayingCoop,
			playerSlotsFilled,
			totalPlayerSlots,
			playersInLobby,
			onPlayerDeckClicked,
			onPlayerGraveyardClicked,
			onOpponentGraveyardClicked,
			onGameObjectiveClicked,
			onLeaveGame,
			onLeaveAndContinue,
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

	.popup-view {
		z-index: 1;
		pointer-events: auto;
	}

	.player-deck-button-container {
		right: 0;
		bottom: calc(calc(20% + 8px) + 100px);
		margin-right: -44px;
		filter: invert(42%) sepia(93%) saturate(1000%) hue-rotate(140deg) brightness(100%) contrast(119%);

		&:hover {
			margin-right: 0;
		}
	}

	.player-graveyard-button-container {
		right: 0;
		bottom: calc(20% + 8px);
		margin-right: -44px;
		filter: invert(42%) sepia(93%) saturate(1000%) hue-rotate(140deg) brightness(100%) contrast(119%);

		&:hover {
			margin-right: 0;
		}
	}

	.opponent-graveyard-button-container {
		right: 0;
		top: 7%;
		margin-right: -44px;
		filter: invert(42%) sepia(93%) saturate(1000%) hue-rotate(310deg) brightness(100%) contrast(220%);

		&:hover {
			margin-right: 0;
		}
	}

	.game-objective-button-container {
		left: 0;
		top: 20%;
		margin-left: -44px;
		filter: invert(24%) sepia(100%) saturate(1671%) hue-rotate(322deg) brightness(88%) contrast(90%);
		transform: scale(-1, 1);

		&:hover {
			margin-left: 0;
		}
	}

	.player-deck-button-container,
	.player-graveyard-button-container,
	.opponent-graveyard-button-container,
	.game-objective-button-container {
		border: none;
		position: absolute;
		pointer-events: all;
		transition: margin-left 0.3s, margin-right 0.3s, background-color 0.3s;
		cursor: pointer;
		border-radius: 8px;

		& > img {
			padding: 4px 8px;
			height: 72px;
		}

		background: transparent;
		&:hover {
			background: $COLOR_BACKGROUND_TRANSPARENT;
			transition: margin-left 0.3s, margin-right 0.3s, background-color 0s;
		}
	}

	.fade-in-overlay {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../../assets/background-game.webp');
		background-size: cover;
		background-position-x: center;
		background-position-y: bottom;

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
			span {
				display: block;
				margin-bottom: 32px;
			}
		}
	}

	.opponent-smokescreen-container {
		position: absolute;
		top: 0;
		width: 100%;
		background: rgba(black, 0.6);
		box-shadow: 0 0 100px 100px rgba(black, 0.6);
		opacity: 0;
		transition: opacity 1s;

		&.visible {
			opacity: 1;
		}

		span {
			font-family: BrushScript, Roboto, sans-serif;
			font-size: 48px;
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
		flex-direction: column;

		opacity: 0;
		transition: opacity 1s;

		&.visible {
			opacity: 1;
		}
		&.noSmokescreen {
			background: rgba(black, 0);
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
		z-index: 3000;
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
		max-width: 160px;
		display: flex;
		flex-direction: column;
		padding: 64px;
		align-items: flex-end;
		justify-content: center;
		bottom: calc(9.5% + 16px);

		.player-name {
			font-weight: bold;
			font-size: 30px;
			margin: 24px 0;
		}

		& > div {
			margin: 4px 0;
		}
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

.objective-container {
	position: absolute;
	left: 0;
	height: calc(100%);
	width: 500px;

	font-size: 24px;
	text-align: start;
	font-family: 'Alegreya Sans', sans-serif;

	margin-left: -500px;
	transition: margin-left 0.3s;

	&.visible {
		margin-left: 96px;
	}

	&.no-transition {
		transition: margin-left 0s;
	}

	.objective-content {
		position: relative;
		top: 20%;
		padding: 13px 32px;
		background: rgba(darken($COLOR-PRIMARY, 20), 0.7);
		border-radius: 8px;
		margin-bottom: 200px;
		backdrop-filter: blur(4px);

		.objective-modifiers {
			margin-top: 8px;
			width: 100%;
		}

		.objective-title {
			font-weight: bold;
			color: $COLOR-SECONDARY;
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

.waiting-for-players {
	margin-bottom: 0;
	font-size: 0.8em;
}

.player-list {
	margin-top: 8px;
	font-size: 0.8em;

	span {
		margin-bottom: 0 !important;
	}
}

.menu-separator {
	width: 100%;
	height: 1px;
	background: black;
	margin: 8px 0;
}
</style>
