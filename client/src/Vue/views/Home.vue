<template>
	<div class="home">
		<pixi />
		<div v-if="!isInGame">
			<login />
			<game-list />
			<font-loader />
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import store from '@/Vue/store'
import Pixi from '../components/pixi/Pixi'
import Login from '../components/login/Login'
import GameList from '../components/games/TheGameList'
import FontLoader from '../components/login/FontLoader'

export default Vue.extend({
	components: { Pixi, Login, GameList, FontLoader },

	computed: {
		isInGame() {
			return !!store.state.selectedGameId
		}
	}
})
</script>
