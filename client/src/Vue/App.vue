<template>
	<div id="app">
		<div id="app-background" />
		<div id="content" :class="rootClass">
			<the-navigation-bar v-if="!isInGame" />
			<router-view class="view" />
		</div>
		<the-popup-view />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import TheNavigationBar from '@/Vue/components/navigationbar/TheNavigationBar.vue'
import AudioSystem, {AudioSystemMode} from '@/Pixi/audio/AudioSystem'
import {editorCardRenderer} from '@/utils/editor/EditorCardRenderer'
import LocalStorage from '@/utils/LocalStorage'
import ThePopupView from '@/Vue/components/popup/ThePopupView.vue'
import axios from 'axios'
import {electronHost, isElectron} from '@/utils/Utils'
import {defineComponent} from '@vue/composition-api'

export default defineComponent({
	components: { ThePopupView, TheNavigationBar },

	async mounted() {
		if (isElectron()) {
			axios.defaults.baseURL = electronHost()
		}
		AudioSystem.setMode(AudioSystemMode.MENU)
		window.addEventListener('contextmenu', this.onContextMenu)
		this.printConsoleWelcomeMessage()
		if (LocalStorage.hasAuthCookie()) {
			await store.dispatch.editor.loadCardLibrary()
			editorCardRenderer.startRenderingService()
		}
	},

	beforeDestroy() {
		window.removeEventListener('contextmenu', this.onContextMenu)
	},

	computed: {
		isInGame(): boolean {
			return store.getters.gameStateModule.isInGame
		},

		rootClass() {
			return {
				'in-game': this.isInGame as boolean,
				'navigation-bar-visible': !this.isInGame as boolean
			}
		}
	},

	methods: {
		onContextMenu(event: MouseEvent): boolean {
			if (!event.ctrlKey && !event.shiftKey) {
				event.preventDefault()
				return false
			}
			return true
		},

		printConsoleWelcomeMessage(): void {
			const headerStyle = 'color: #bada55; padding: 4px; font-size: 24px'
			const textStyle = 'color: #bada55; padding:4px; font-size: 14px'
			const warningStyle = 'color: #daba55; padding:4px; font-size: 14px'

			const message = 'If you DO know what you\'re doing, have fun hacking!\n'
				+ 'This is an open-source project. You can find the code at https://github.com/Tenebrie/notgwent-game.'
				+ ' If you find a bug or an exploit, or if you have a feature request, feel free to open an issue on GitHub.'
				+ ' You can also make a pull request with a fix. Contributions are welcome!'

			console.info('%cHowdy!', headerStyle)
			console.info('%cIf you don\'t know what you\'re doing, be VERY careful! Don\'t paste here anything that you do not understand!', warningStyle)
			console.info(`%c${message}`, textStyle)
			console.info('%cAlso, you can summon browser context menu by using Shift or Ctrl when right-clicking an element.', textStyle)
		}
	}
})
</script>

<style lang="scss">
@import "styles/generic";
@import '~vuejs-noty/dist/vuejs-noty.css';

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

		a {
			color: $COLOR-SECONDARY;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}

			&.router-link-exact-active {
				color: #42b983;
			}
		}
	}

	#app-background {
		position: absolute;
		width: 100%;
		height: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('./assets/background-menu.jpg');
		background-size: cover;
		filter: blur(8px);
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

button.primary, .swal-button, .button-primary {
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
	}

	&:active {
		color: darken($COLOR-TEXT, 10);
		border-color: darken($COLOR-PRIMARY, 10);
		background-color: darken($COLOR-PRIMARY, 10);
	}
}

button.secondary, .button-secondary {
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
	}

	&:active {
		background-color: rgba(white, 0.1) !important;
	}
}

input[type="text"], input[type="password"] {
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

span.info-text {
	font-size: 0.8em;
	color: gray;
}

.noty_body {
	font-family: 'Roboto', sans-serif;
	font-size: 1.0em !important;
}

.noty_bar {
	box-shadow: black 0 0 4px 4px;
}

.noty_type__info > .noty_body {
	background: #323232;
}

.noty_type__success > .noty_body {
	background: darkgreen;
}

.noty_type__warning > .noty_body {
	background: darken(darkorange, 10);
}

.noty_type__error > .noty_body {
	background: darkred;
}

.noty_progressbar {
	opacity: 0.75 !important;
	background-color: white !important;
	top: 0;
}

.noty_theme__mint {
	border-bottom: none !important;
}
</style>
