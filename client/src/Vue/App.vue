<template>
	<div id="app" :class="rootClass" >
		<div id="app-background" />
		<div id="content">
			<the-navigation-bar v-if="!isInGame" />
			<router-view class="view" />
			<the-footer v-if="!isInGame" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheFooter from '@/Vue/components/TheFooter.vue'
import TheNavigationBar from '@/Vue/components/navigationbar/TheNavigationBar.vue'

export default Vue.extend({
	components: { TheNavigationBar, TheFooter },

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		},

		rootClass(): {} {
			return {
				'in-game': this.isInGame as boolean,
				'navigation-bar-visible': !this.isInGame as boolean
			}
		}
	}
})
</script>

<style lang="scss">
@import "styles/generic";

body {
	background: #121212;
	padding: 0;
	margin: 0;
	overflow: hidden;
}

#app {
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
		}

		&.navigation-bar-visible {
			padding-top: 48px;
			height: calc(100vh - 48px);
		}

		.view {
			height: 100%;
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

button {
	cursor: pointer;
}

button.primary {
	border-radius: 0.25em;
	width: 100%;
	padding: 0.5em;
	margin: 0.25em 0;
	font-family: Roboto, sans-serif;
	color: $COLOR-TEXT;
	background-color: $COLOR-PRIMARY;
	border: 1px solid $COLOR-PRIMARY;
	outline: none;

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

button.secondary {
	border: 1px solid $COLOR-TEXT;
	border-radius: 4px;
	width: 100%;
	padding: calc(0.25em - 1px);
	margin: 0.25em 0;
	font-size: 1em;
	font-family: Roboto, sans-serif;
	color: $COLOR-TEXT;
	background-color: transparent;
	outline: none;

	&:hover {
		background-color: rgba(white, 0.05);
	}

	&:active {
		background-color: rgba(white, 0.1);
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
</style>
