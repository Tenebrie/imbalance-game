<template>
	<div id="app">
		<div id="app-background" />
		<div id="content" :class="rootClass">
			<the-navigation-bar v-if="!isInGame" />
			<router-view class="view" />
		</div>
		<the-popup-view v-if="!isInGame" />
		<pixi-inspected-card v-if="!isInGame" />
		<the-notification-view />
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'

import AudioSystem, { AudioSystemMode } from '@/Pixi/audio/AudioSystem'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'
import LocalStorage from '@/utils/LocalStorage'
import { electronHost, isElectron } from '@/utils/Utils'
import TheNavigationBar from '@/Vue/components/navigationbar/TheNavigationBar.vue'
import PixiInspectedCard from '@/Vue/components/pixi/PixiInspectedCard.vue'
import TheNotificationView from '@/Vue/components/popup/connectionLostNotification/TheNotificationView.vue'
import ThePopupView from '@/Vue/components/popup/ThePopupView.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: { TheNotificationView, ThePopupView, TheNavigationBar, PixiInspectedCard },

	async mounted() {
		if (isElectron()) {
			axios.defaults.baseURL = electronHost()
		}

		AudioSystem.setMode(AudioSystemMode.MENU)
		window.addEventListener('contextmenu', this.onContextMenu)
		this.printConsoleWelcomeMessage()
		if (LocalStorage.hasAuthCookie()) {
			await store.dispatch.rulesets.loadLibrary()
			await store.dispatch.editor.loadCardLibrary()
			editorCardRenderer.startRenderingService()
		}
		store.dispatch.globalSocketModule.connectGlobalWebSocket()
		store.dispatch.globalSocketModule.keepGlobalWebSocketAlive()
	},

	beforeUnmount() {
		window.removeEventListener('contextmenu', this.onContextMenu)
	},

	computed: {
		isInGame(): boolean {
			return store.getters.gameStateModule.isInGame
		},

		rootClass() {
			return {
				'in-game': store.getters.gameStateModule.isInGame,
				'navigation-bar-visible': !store.getters.gameStateModule.isInGame,
			}
		},
	},

	methods: {
		onContextMenu(event: MouseEvent): boolean {
			if (!event.ctrlKey) {
				event.preventDefault()
				return false
			}
			return true
		},

		printConsoleWelcomeMessage(): void {
			const headerStyle = 'color: #bada55; padding: 4px; font-size: 24px'
			const textStyle = 'color: #bada55; padding:4px; font-size: 14px'
			const warningStyle = 'color: #daba55; padding:4px; font-size: 14px'

			const message =
				"If you DO know what you're doing, have fun hacking!\n" +
				'This is an open-source project. You can find the code at https://github.com/Tenebrie/imbalance-game.' +
				' If you find a bug or an exploit, or if you have a feature request, feel free to open an issue on GitHub.' +
				' You can also make a pull request with a fix. Contributions are welcome!'

			console.info('%cHowdy!', headerStyle)
			console.info(
				"%cIf you don't know what you're doing, be VERY careful! Don't paste here anything that you do not understand!",
				warningStyle
			)
			console.info(`%c${message}`, textStyle)
			console.info('%cAlso, you can summon browser context menu by using Ctrl when right-clicking an element.', textStyle)
		},
	},
})
</script>

<style lang="scss">
@import 'styles/generic';

body {
	background: #121212;
	padding: 0;
	margin: 0;
	overflow: hidden;
}

*::-webkit-scrollbar {
	width: 10px;
}

*::-webkit-scrollbar-thumb {
	background: #666;
	border-radius: 20px;
}

*::-webkit-scrollbar-track {
	background: #ffffff20;
	border-radius: 20px;
}

a {
	color: $COLOR-SECONDARY;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
}

#app {
	overflow: hidden;
	font-family: Roboto, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: $COLOR-TEXT;
	height: 100vh;
	padding: 0;
	overflow-y: auto;

	#content {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;

		&.in-game {
			overflow-y: hidden;
			.view {
				height: 100vh;
			}
		}

		&.navigation-bar-visible {
			padding-top: 48px;
			height: calc(100vh - #{$NAVIGATION-BAR-HEIGHT});

			.view {
				width: 100%;
				height: 100%;

				& > * {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	#app-background {
		position: absolute;
		width: 100%;
		height: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('./assets/background-game.webp');
		background-size: cover;
		background-position-x: center;
		background-position-y: bottom;
		filter: blur(8px);
		// Chrome issue with large backgrounds killing performance
		// https://stackoverflow.com/questions/7033979/my-fixed-background-made-scrolling-the-site-very-slow-what-can-i-do-to-improve
		-webkit-transform: translate3d(0, 0, 0);
	}
}

.button-link {
	font-size: 1.4em;
	padding: 16px 8px;
	width: calc(100% - 16px);
	cursor: pointer;
	user-select: none;
	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
	}
}

button {
	cursor: pointer;
}

label.button.primary,
button.primary,
.swal-button,
.button-primary {
	text-align: center;
	cursor: pointer;
	border-radius: 0.25em;
	width: 100%;
	padding: 0.5em 1em;
	margin: 0.25em 0;
	font-family: Roboto, sans-serif;
	font-size: 1em;
	color: $COLOR-TEXT;
	background-color: $COLOR-PRIMARY;
	border: 1px solid $COLOR-PRIMARY;
	outline: none;
	box-sizing: border-box;
	transition: background-color 0.3s, border 0.3s;

	&.destructive {
		color: lighten(red, 15);
		&:hover {
			color: lighten(red, 10);
		}
		&:active {
			color: lighten(red, 5);
		}
	}

	&:hover {
		color: darken($COLOR-TEXT, 5);
		border-color: darken($COLOR-PRIMARY, 5);
		background-color: darken($COLOR-PRIMARY, 5);
		transition: background-color 0s, border 0s;
	}

	&:active {
		color: darken($COLOR-TEXT, 10);
		border-color: darken($COLOR-PRIMARY, 10);
		background-color: darken($COLOR-PRIMARY, 10);
	}
}

button.secondary,
.button-secondary {
	border-radius: 0.25em;
	width: 100%;
	padding: 0.5em 1em;
	margin: 0.25em 0;
	font-family: Roboto, sans-serif;
	font-size: 1em;
	color: $COLOR-TEXT;
	background-color: transparent;
	border: 1px solid $COLOR-TEXT;
	outline: none;
	transition: background-color 0.3s;

	&.destructive {
		color: lighten(red, 15);
		&:hover {
			color: lighten(red, 10);
		}
		&:active {
			color: lighten(red, 5);
		}
	}

	&:hover {
		background-color: rgba(white, 0.05);
		transition: background-color 0s;
	}

	&:active {
		background-color: rgba(white, 0.1) !important;
	}
}

input[type='text'],
input[type='number'],
input[type='password'],
textarea {
	font-family: Roboto, sans-serif;
	color: $COLOR-TEXT;
	outline: none;
	width: calc(100% - 16px);
	height: 2em;
	margin: 4px 0;
	padding: 4px 8px;
	border: none;
	border-radius: 4px;
	background: rgba(white, 0.1);
}

input[type='text']:disabled,
input[type='number']:disabled,
input[type='password']:disabled,
textarea:disabled {
	background: rgba(#333, 0.75);
}

input:invalid {
	border: 1px red !important;
}

span.info-text {
	font-size: 0.8em;
	color: gray;
}

div.menu-separator {
	width: 100%;
	height: 1px;
	margin: 8px 0;
	background: $COLOR_BACKGROUND_GAME_MENU_BORDER;
}

.action-explanation {
	margin-bottom: 16px;
	text-align: left;
	width: 100%;
	color: gray;
	font-style: italic;

	&:last-of-type {
		margin-bottom: 0;
	}
}
</style>
