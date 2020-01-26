<template>
	<div id="app" :class="rootClass" >
		<the-navigation-bar v-if="!isInGame" />
		<router-view class="view" />
		<the-footer v-if="!isInGame" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheFooter from '@/Vue/components/TheFooter.vue'
import TheNavigationBar from '@/Vue/components/navigationbar/TheNavigationBar.vue'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default Vue.extend({
	components: { TheNavigationBar, TheFooter },

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.prepare()
		}, 500)
	},

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

button {
	cursor: pointer;
}

button.primary {
	border: none;
	border-radius: 4px;
	width: 100%;
	padding: 8px;
	margin: 4px 0;
	font-size: 1.0em;
	font-family: Roboto, sans-serif;
	background-color: $COLOR-PRIMARY;
	outline: none;

	&:hover {
		background-color: darken($COLOR-PRIMARY, 5);
	}

	&:active {
		background-color: darken($COLOR-PRIMARY, 10);
	}
}

button.secondary {
	border: none;
	border-radius: 4px;
	color: $COLOR-TEXT;
	width: 100%;
	padding: 8px;
	margin: 4px 0;
	font-size: 1em;
	font-family: Roboto, sans-serif;
	background-color: rgba(white, 0.2);
	outline: none;

	&:hover {
		background-color: rgba(white, 0.175);
	}

	&:active {
		background-color: rgba(white, 0.15);
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
